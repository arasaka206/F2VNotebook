import React from 'react';
import AIHerdNotebook from '../components/notebook/AIHerdNotebook';

const NotebookPage: React.FC = () => {
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-2">Nhật ký Đàn vật nuôi (AI-Powered)</h2>
          <p className="text-gray-400 text-sm">
            Tại đây, bạn có thể ghi chép lại các triệu chứng, hành vi bất thường hoặc hoạt động hàng ngày của vật nuôi bằng ngôn ngữ tự nhiên. 
            Hệ thống AI sẽ tự động phân tích mức độ nghiêm trọng, phân loại bệnh và đưa ra các khuyến nghị y tế ngay lập tức.
          </p>
        </div>
        
        {/* Render component AI Herd Notebook ở chế độ rộng rãi */}
        <AIHerdNotebook />
      </div>
    </div>
  );
};

export default NotebookPage;