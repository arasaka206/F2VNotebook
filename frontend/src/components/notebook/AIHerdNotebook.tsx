import React, { useState, useEffect } from 'react';
import api from '../../services/api';

interface AnalysisResult {
  summary: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  tags: string[];
  recommendations: string[];
}

interface Note {
  id: string;
  content: string;
  timestamp: Date;
  analysis?: AnalysisResult | null;
}

const AIHerdNotebook: React.FC = () => {
  const [log, setLog] = useState('');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);

  // 1. TẢI LỊCH SỬ TỪ DATABASE KHI MỞ TRANG
  const fetchNotes = async () => {
    try {
      const res = await api.get('/ai/notebook');
      // Chuyển đổi timestamp từ DB (chuỗi) sang kiểu Date của Javascript
      const loadedNotes = res.data.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp + 'Z') 
      }));
      setNotes(loadedNotes);
    } catch (error) {
      console.error('Lỗi khi tải lịch sử:', error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // 2. LƯU BÌNH THƯỜNG XUỐNG DATABASE
  const handleSaveNormal = async () => {
    if (!log.trim()) return;
    setLoading(true);
    
    try {
      await api.post('/ai/notebook', { content: log });
      await fetchNotes(); // Gọi lại hàm fetch để cập nhật danh sách
      setLog('');
    } catch (error) {
      alert('Lỗi khi lưu ghi chú');
    } finally {
      setLoading(false);
    }
  };

  // 3. PHÂN TÍCH AI RỒI LƯU XUỐNG DATABASE
  const handleAnalyzeAndSave = async () => {
    if (!log.trim()) return;
    setLoading(true);

    try {
      // B1: Hỏi AI
      const aiRes = await api.post('/ai/analyze-log', { content: log });
      
      // B2: Lưu nội dung + Kết quả AI xuống DB
      await api.post('/ai/notebook', {
        content: log,
        ...aiRes.data // Rải các trường summary, urgency, tags, recommendations vào
      });

      await fetchNotes(); // Tải lại danh sách
      setLog('');
    } catch (error) {
      alert('Không thể kết nối đến AI hoặc lỗi lưu trữ.');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-green-500/20 text-green-400 border-green-500/50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg p-5 shadow-lg border border-gray-800 flex flex-col space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">📓</span>
          <div>
            <h3 className="text-md font-semibold text-white">Thêm Ghi Chép Mới</h3>
            <p className="text-xs text-gray-400">Viết nhật ký bình thường hoặc nhờ AI phân tích triệu chứng</p>
          </div>
        </div>

        <textarea
          value={log}
          onChange={(e) => setLog(e.target.value)}
          placeholder="Ghi chép tình trạng vật nuôi, thức ăn, vaccine..."
          className="w-full bg-gray-800 text-sm text-gray-200 border border-gray-700 rounded-lg p-3 outline-none focus:ring-1 focus:ring-blue-500 h-28 resize-none"
        />

        <div className="flex gap-3">
          <button
            onClick={handleSaveNormal}
            disabled={loading || !log.trim()}
            className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
          >
            📝 Lưu thông thường
          </button>
          
          <button
            onClick={handleAnalyzeAndSave}
            disabled={loading || !log.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2"
          >
            {loading ? <span className="animate-pulse">⏳ Đang xử lý...</span> : <><span>✨</span> Phân tích AI & Lưu</>}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200">Lịch sử Ghi chép</h3>
        
        {notes.length === 0 ? (
          <div className="text-center p-6 text-gray-500 bg-gray-800/50 rounded-lg border border-gray-700 border-dashed">
            Chưa có ghi chép nào.
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3 shadow-sm animate-fade-in">
              <div className="flex justify-between items-start">
                <p className="text-sm text-gray-200 whitespace-pre-wrap">{note.content}</p>
                <span className="text-xs text-gray-500 ml-4 flex-shrink-0">
                  {note.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {note.timestamp.toLocaleDateString()}
                </span>
              </div>

              {note.analysis && (
                <div className="mt-3 pt-3 border-t border-gray-700 text-sm bg-gray-900/50 -mx-4 -mb-4 p-4 rounded-b-lg">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${getUrgencyColor(note.analysis.urgency)}`}>
                      Mức độ: {note.analysis.urgency}
                    </span>
                    {note.analysis.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-gray-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <strong className="text-gray-300 block mb-1">Chẩn đoán:</strong>
                      <p className="text-gray-400 leading-relaxed text-xs">{note.analysis.summary}</p>
                    </div>
                    <div>
                      <strong className="text-gray-300 block mb-1">Đề xuất xử lý:</strong>
                      <ul className="list-disc pl-5 text-gray-400 text-xs space-y-1">
                        {note.analysis.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );  
};

export default AIHerdNotebook;