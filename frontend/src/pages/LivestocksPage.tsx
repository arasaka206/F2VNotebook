import React, { useEffect, useState } from 'react';
import { fetchLivestock } from '../services/farm2vets';
import api from '../services/api'; // Import để gọi API POST
import type { Livestock } from '../types';

const LivestockPage: React.FC = () => {
  const [livestockList, setLivestockList] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState(true);

  // State cho Form thêm mới
  const [newSpecies, setNewSpecies] = useState('Bò');
  const [newTag, setNewTag] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hàm tải dữ liệu
  const loadData = () => {
    setLoading(true);
    fetchLivestock()
      .then(setLivestockList)
      .catch((err) => console.error("Lỗi lấy danh sách:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Hàm xử lý khi bấm nút "Thêm vật nuôi"
  const handleAddLivestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag) return alert("Vui lòng nhập số thẻ tai!");
    
    setIsSubmitting(true);
    try {
      await api.post('/livestock/', {
        species: newSpecies,
        tag_number: newTag,
        weight_kg: newWeight ? parseFloat(newWeight) : null
      });
      // Xóa form và tải lại danh sách
      setNewTag('');
      setNewWeight('');
      loadData();
    } catch (error) {
      alert("Lỗi khi thêm vật nuôi!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 text-white animate-pulse">Đang tải hồ sơ...</div>;

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Livestock Profiles</h1>
          <p className="text-gray-400 text-sm">Quản lý toàn bộ {livestockList.length} vật nuôi trong trang trại</p>
        </div>
      </div>

      {/* Form thêm mới nhanh */}
      <form onSubmit={handleAddLivestock} className="card flex flex-wrap gap-4 items-end mb-8 bg-primary-900/20 border-primary-500/30">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Loài</label>
          <select 
            value={newSpecies} onChange={(e) => setNewSpecies(e.target.value)}
            className="bg-farm-border text-white text-sm rounded-lg px-3 py-2 outline-none w-32"
          >
            <option value="Bò">Bò</option>
            <option value="Lợn">Lợn</option>
            <option value="Gà">Gà</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Số thẻ tai (Tag)</label>
          <input 
            type="text" placeholder="VD: COW-002" value={newTag} onChange={(e) => setNewTag(e.target.value)}
            className="bg-farm-border text-white text-sm rounded-lg px-3 py-2 outline-none w-40"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Cân nặng (kg)</label>
          <input 
            type="number" placeholder="Tùy chọn" value={newWeight} onChange={(e) => setNewWeight(e.target.value)}
            className="bg-farm-border text-white text-sm rounded-lg px-3 py-2 outline-none w-32"
          />
        </div>
        <button 
          type="submit" disabled={isSubmitting}
          className="bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors"
        >
          {isSubmitting ? "Đang thêm..." : "+ Thêm vật nuôi"}
        </button>
      </form>

      {/* Lưới hiển thị danh sách */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {livestockList.map((animal) => (
          <div key={animal.id} className="card hover:border-primary-500/50 transition-colors cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="text-3xl">{animal.species === 'Bò' ? '🐄' : animal.species === 'Lợn' ? '🐖' : '🐔'}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                animal.health_status === 'Bình thường' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {animal.health_status}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-wide">{animal.tag_number}</h3>
            <p className="text-sm text-gray-400 mb-4">{animal.species}</p>
            
            <div className="space-y-1.5 border-t border-farm-border pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Cân nặng:</span>
                <span className="text-gray-300">{animal.weight_kg ? `${animal.weight_kg} kg` : '—'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Ngày nhập:</span>
                <span className="text-gray-300">{new Date(animal.created_at).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
        ))}
        
        {livestockList.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-8">
            Chưa có vật nuôi nào. Hãy thêm ở form phía trên!
          </div>
        )}
      </div>
    </div>
  );
};

export default LivestockPage;