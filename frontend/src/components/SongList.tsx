import React, { useMemo, useState, useRef } from 'react';
import { Table, Checkbox, Button, Space, Tooltip, Audio } from 'antd';

interface SongInfo {
  [key: string]: any;
}

interface SearchResult {
  source: string;
  index: number;
  song_info: SongInfo;
}

interface SongListProps {
  searchResults: SearchResult[];
  selectedSongs: SongInfo[];
  handleSongSelect: (record: SearchResult, checked: boolean) => void;
  handleSelectAll: (checked: boolean) => void;
  handleDownload: () => void;
  isDownloading: boolean;
}

const SongList: React.FC<SongListProps> = ({
  searchResults,
  selectedSongs,
  handleSongSelect,
  handleSelectAll,
  handleDownload,
  isDownloading,
}) => {
  // 预览状态管理
  const [previewSong, setPreviewSong] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 处理预览
  const handlePreview = (record: SearchResult) => {
    const songId = `${record.source}-${record.index}`;
    
    // 如果正在预览当前歌曲，则停止预览
    if (previewSong === songId && audioRef.current) {
      audioRef.current.pause();
      setPreviewSong(null);
      return;
    }
    
    // 停止之前的预览
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // 设置新的预览歌曲
    setPreviewSong(songId);
  };

  // 表格列定义
  const columns = useMemo(() => [
    {
      title: '选择',
      dataIndex: 'selected',
      key: 'selected',
      render: (_: any, record: SearchResult) => {
        // 根据唯一标识符判断是否选中
        const uniqueId = `${record.source}-${record.index}`;
        const isChecked = selectedSongs.some(song => song.__unique_id === uniqueId);
        return (
          <Checkbox 
            checked={isChecked} 
            onChange={(e) => handleSongSelect(record, e.target.checked)} 
          />
        );
      },
    },
    {
      title: '歌曲名',
      dataIndex: ['song_info', 'song_name'],
      key: 'song_name',
      ellipsis: true,
    },
    {
      title: '歌手',
      dataIndex: ['song_info', 'singers'],
      key: 'singers',
      ellipsis: true,
    },
    {
      title: '专辑',
      dataIndex: ['song_info', 'album'],
      key: 'album',
      ellipsis: true,
    },
    {
      title: '时长',
      dataIndex: ['song_info', 'duration'],
      key: 'duration',
    },
    {
      title: '文件大小',
      dataIndex: ['song_info', 'file_size'],
      key: 'file_size',
    },
    {
      title: '格式',
      dataIndex: ['song_info', 'ext'],
      key: 'ext',
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: SearchResult) => {
        const songId = `${record.source}-${record.index}`;
        const isPreviewing = previewSong === songId;
        const hasDownloadUrl = record.song_info.download_url;
        
        return (
          <Space size="middle">
            <Tooltip title={hasDownloadUrl ? (isPreviewing ? "停止预览" : "预览歌曲") : "无预览链接"}>
              <Button 
                type="text" 
                icon={isPreviewing ? "⏸" : "▶"} 
                onClick={() => hasDownloadUrl && handlePreview(record)}
                disabled={!hasDownloadUrl}
                style={{ color: hasDownloadUrl ? '#1890ff' : '#999' }}
              >
                {isPreviewing ? "停止" : "预览"}
              </Button>
            </Tooltip>
          </Space>
        );
      },
    },
  ], [selectedSongs, handleSongSelect, previewSong]);

  // 获取当前预览歌曲的下载链接
  const currentPreviewSong = useMemo(() => {
    if (!previewSong) return null;
    const [source, index] = previewSong.split('-');
    return searchResults.find(item => item.source === source && item.index === parseInt(index));
  }, [previewSong, searchResults]);

  return (
    <div className="results-section fade-in">
      <div className="results-header">
        <h2>搜索结果 ({searchResults.length} 首)</h2>
        <Space>
          <Checkbox 
            onChange={(e) => handleSelectAll(e.target.checked)} 
            checked={selectedSongs.length === searchResults.length && searchResults.length > 0}
          >
            全选
          </Checkbox>
          <Button 
            type="primary" 
            onClick={handleDownload} 
            loading={isDownloading}
            disabled={selectedSongs.length === 0}
            size="large"
          >
            下载选中 ({selectedSongs.length})
          </Button>
        </Space>
      </div>
      
      {/* 音频播放器 */}
      {currentPreviewSong && (
        <div style={{ 
          marginBottom: 16, 
          padding: 16, 
          backgroundColor: '#f0f8ff', 
          borderRadius: 8, 
          border: '1px solid #e6f7ff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, color: '#1890ff' }}>正在预览</h3>
              <p style={{ margin: 8, fontSize: 14, color: '#333' }}>
                {currentPreviewSong.song_info.song_name} - {currentPreviewSong.song_info.singers}
              </p>
            </div>
            <audio
              ref={audioRef}
              src={currentPreviewSong.song_info.download_url}
              autoPlay
              controls
              style={{ width: 300 }}
              onEnded={() => setPreviewSong(null)}
            />
          </div>
        </div>
      )}
      
      <Table 
        columns={columns} 
        dataSource={searchResults} 
        rowKey={(record, index) => `${record.source}-${index}`}
        pagination={{ 
          pageSize: 10, 
          showSizeChanger: true, 
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `共 ${total} 首歌曲`
        }}
        size="middle"
      />
    </div>
  );
};

export default SongList;