import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, Modal, Progress, Button, message } from 'antd';
import axios from 'axios';
import './App.css';

// 导入组件
import SearchForm from './components/SearchForm';
import PlaylistForm from './components/PlaylistForm';
import HistorySection from './components/HistorySection';
import SongList from './components/SongList';

interface SongInfo {
  [key: string]: any;
}

interface SearchResult {
  source: string;
  index: number;
  song_info: SongInfo;
}

interface SearchHistoryItem {
  keyword: string;
  timestamp: number;
}

interface DownloadHistoryItem {
  song_name: string;
  singers: string;
  timestamp: number;
  source: string;
  ext: string;
}

const App: React.FC = () => {
  // 状态管理
  const [keyword, setKeyword] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<SongInfo[]>([]);
  const [musicSources, setMusicSources] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [playlistUrl, setPlaylistUrl] = useState<string>('');
  const [isParsingPlaylist, setIsParsingPlaylist] = useState<boolean>(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistoryItem[]>([]);

  // 从本地存储加载历史记录
  useEffect(() => {
    const loadHistory = () => {
      try {
        const savedSearchHistory = localStorage.getItem('searchHistory');
        const savedDownloadHistory = localStorage.getItem('downloadHistory');
        
        if (savedSearchHistory) {
          setSearchHistory(JSON.parse(savedSearchHistory));
        }
        
        if (savedDownloadHistory) {
          setDownloadHistory(JSON.parse(savedDownloadHistory));
        }
      } catch (error) {
        console.error('加载历史记录失败:', error);
      }
    };

    loadHistory();
  }, []);

  // 保存搜索历史到本地存储
  useEffect(() => {
    try {
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    } catch (error) {
      console.error('保存搜索历史失败:', error);
    }
  }, [searchHistory]);

  // 保存下载历史到本地存储
  useEffect(() => {
    try {
      localStorage.setItem('downloadHistory', JSON.stringify(downloadHistory));
    } catch (error) {
      console.error('保存下载历史失败:', error);
    }
  }, [downloadHistory]);

  // 获取支持的音乐源
  useEffect(() => {
    const fetchMusicSources = async () => {
      try {
        const response = await axios.get('/api/music-sources');
        setMusicSources(response.data.music_sources);
        // 默认选择国内五大音乐平台
        const defaultSources = ['MiguMusicClient', 'NeteaseMusicClient', 'QQMusicClient', 'KuwoMusicClient', 'QianqianMusicClient'];
        setSelectedSources(defaultSources.filter(source => response.data.music_sources.includes(source)));
      } catch (error) {
        message.error('获取音乐源失败');
        console.error('获取音乐源失败:', error);
      }
    };

    fetchMusicSources();
  }, []);

  // 搜索音乐
  const handleSearch = useCallback(async () => {
    if (!keyword.trim()) {
      message.error('请输入搜索关键词');
      return;
    }

    // 添加搜索历史
    const newSearchHistoryItem: SearchHistoryItem = {
      keyword: keyword.trim(),
      timestamp: Date.now()
    };
    setSearchHistory(prev => {
      // 移除重复的关键词
      const filtered = prev.filter(item => item.keyword !== keyword.trim());
      // 添加到开头并限制数量
      return [newSearchHistoryItem, ...filtered].slice(0, 10);
    });

    setIsSearching(true);
    try {
      const response = await axios.post('/api/search', {
        keyword: keyword.trim(),
        music_sources: selectedSources
      });
      setSearchResults(response.data.results);
      setSelectedSongs([]);
      message.success(`找到 ${response.data.results.length} 首歌曲`);
    } catch (error) {
      message.error('搜索失败');
      console.error('搜索失败:', error);
    } finally {
      setIsSearching(false);
    }
  }, [keyword, selectedSources]);

  // 下载音乐
  const handleDownload = useCallback(async () => {
    if (selectedSongs.length === 0) {
      message.error('请选择要下载的歌曲');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    // 模拟下载进度
    const progressInterval = setInterval(() => {
      setDownloadProgress(prev => {
        const next = prev + 10;
        return next > 90 ? 90 : next;
      });
    }, 200);

    try {
      // 检查selectedSongs的结构
      console.log('Selected songs for download:', selectedSongs);
      
      // 先尝试使用浏览器下载方式
      let hasValidDownloadUrl = false;
      for (const song of selectedSongs) {
        if (song.download_url) {
          hasValidDownloadUrl = true;
          // 检查download_url的类型
          console.log('Download URL type:', typeof song.download_url);
          console.log('Download URL value:', song.download_url);
          
          // 创建文件名：歌曲名 - 歌手名.扩展名
          const filename = `${song.song_name || '未知歌曲'} - ${song.singers || '未知歌手'}.${song.ext || 'mp3'}`;
          
          try {
            // 对于字符串类型的URL，优先使用fetch API下载
            if (typeof song.download_url === 'string' && song.download_url.startsWith('http')) {
              // 直接使用fetch API下载，避免浏览器预览
              console.log('Using fetch API to download:', song.download_url);
              const response = await fetch(song.download_url, {
                method: 'GET',
                headers: {
                  'Accept': '*/*'
                }
              });
              
              if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.target = '_self';
                link.rel = 'noopener noreferrer';
                
                // 模拟点击下载
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                console.log('Fetch download successful:', filename);
              } else {
                console.warn('Fetch response not ok:', response.status);
                // 即使fetch失败，也尝试强制下载
                const link = document.createElement('a');
                link.href = song.download_url;
                link.download = filename;
                link.target = '_self';
                link.rel = 'noopener noreferrer';
                // 添加时间戳防止缓存
                link.href = song.download_url + (song.download_url.includes('?') ? '&' : '?') + 'timestamp=' + Date.now();
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            } else {
              console.warn('Invalid download URL format:', song.download_url);
              // 对于无效格式的URL，也尝试强制下载
              try {
                const link = document.createElement('a');
                link.href = String(song.download_url);
                link.download = filename;
                link.target = '_self';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              } catch (error) {
                console.error('Invalid URL download failed:', error);
              }
            }
          } catch (error) {
            console.error('Browser download failed:', error);
            // 如果所有方法都失败，尝试直接下载
            try {
              const link = document.createElement('a');
              link.href = song.download_url;
              link.download = filename;
              link.target = '_self';
              link.rel = 'noopener noreferrer';
              // 添加时间戳防止缓存
              link.href = song.download_url + (song.download_url.includes('?') ? '&' : '?') + 'timestamp=' + Date.now();
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } catch (fallbackError) {
              console.error('Fallback download failed:', fallbackError);
            }
          }
        }
      }
      
      // 如果没有有效的download_url，回退到后端下载
      if (!hasValidDownloadUrl) {
        console.log('No valid download URLs found, falling back to backend download');
        await axios.post('/api/download', {
          song_infos: selectedSongs
        });
      }
      
      setDownloadProgress(100);
      
      // 添加下载历史
      selectedSongs.forEach(song => {
        const newDownloadHistoryItem: DownloadHistoryItem = {
          song_name: song.song_name || '未知歌曲',
          singers: song.singers || '未知歌手',
          timestamp: Date.now(),
          source: song.source || '未知来源',
          ext: song.ext || '未知格式'
        };
        setDownloadHistory(prev => {
          // 移除重复的歌曲
          const filtered = prev.filter(item => 
            !(item.song_name === song.song_name && item.singers === song.singers)
          );
          // 添加到开头并限制数量
          return [newDownloadHistoryItem, ...filtered].slice(0, 10);
        });
      });
      
      message.success(`开始下载 ${selectedSongs.length} 首歌曲${hasValidDownloadUrl ? '，请在浏览器下载管理器中查看进度' : ''}`);
      setSelectedSongs([]);
    } catch (error) {
      message.error('下载失败');
      console.error('下载失败:', error);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 500);
    }
  }, [selectedSongs]);

  // 清除搜索历史
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
    message.success('搜索历史已清除');
  }, []);

  // 清除下载历史
  const clearDownloadHistory = useCallback(() => {
    setDownloadHistory([]);
    localStorage.removeItem('downloadHistory');
    message.success('下载历史已清除');
  }, []);

  // 从搜索历史中选择关键词
  const selectFromSearchHistory = useCallback((keyword: string) => {
    setKeyword(keyword);
  }, []);

  // 解析播放列表
  const handleParsePlaylist = useCallback(async () => {
    if (!playlistUrl.trim()) {
      message.error('请输入播放列表URL');
      return;
    }

    setIsParsingPlaylist(true);
    try {
      const response = await axios.post('/api/parse-playlist', {
        playlist_url: playlistUrl.trim(),
        music_sources: selectedSources
      });
      const playlistSongs = response.data.results.map((song: SongInfo) => ({
        source: song.source || 'unknown',
        index: 0,
        song_info: song
      }));
      setSearchResults(playlistSongs);
      setSelectedSongs([]);
      message.success(`解析播放列表成功，找到 ${response.data.results.length} 首歌曲`);
    } catch (error) {
      message.error('解析播放列表失败');
      console.error('解析播放列表失败:', error);
    } finally {
      setIsParsingPlaylist(false);
    }
  }, [playlistUrl, selectedSources]);

  // 处理歌曲选择
  const handleSongSelect = useCallback((record: SearchResult, checked: boolean) => {
    if (checked) {
      // 添加source字段到song_info对象
      const songInfoWithSource = {
        ...record.song_info,
        source: record.source,
        // 添加唯一标识符，用于跟踪选中状态
        __unique_id: `${record.source}-${record.index}`
      };
      setSelectedSongs(prev => [...prev, songInfoWithSource]);
    } else {
      // 根据唯一标识符移除歌曲
      const uniqueId = `${record.source}-${record.index}`;
      setSelectedSongs(prev => prev.filter(song => song.__unique_id !== uniqueId));
    }
  }, []);

  // 处理全选
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      // 为每个song_info添加source字段和唯一标识符
      const songsWithSource = searchResults.map(result => ({
        ...result.song_info,
        source: result.source,
        __unique_id: `${result.source}-${result.index}`
      }));
      setSelectedSongs(songsWithSource);
    } else {
      setSelectedSongs([]);
    }
  }, [searchResults]);

  return (
    <div className="app-container fade-in">
      <h1 className="app-title">MusicDL - 音乐下载器</h1>
      
      <Tabs 
        defaultActiveKey="search"
        items={[
          {
            key: 'search',
            label: '搜索音乐',
            children: (
              <SearchForm
                keyword={keyword}
                setKeyword={setKeyword}
                selectedSources={selectedSources}
                setSelectedSources={setSelectedSources}
                musicSources={musicSources}
                handleSearch={handleSearch}
                isSearching={isSearching}
                searchHistory={searchHistory}
                clearSearchHistory={clearSearchHistory}
                selectFromSearchHistory={selectFromSearchHistory}
              />
            ),
          },
          {
            key: 'playlist',
            label: '解析播放列表',
            children: (
              <PlaylistForm
                playlistUrl={playlistUrl}
                setPlaylistUrl={setPlaylistUrl}
                selectedSources={selectedSources}
                setSelectedSources={setSelectedSources}
                musicSources={musicSources}
                handleParsePlaylist={handleParsePlaylist}
                isParsingPlaylist={isParsingPlaylist}
              />
            ),
          },
          {
            key: 'history',
            label: '历史记录',
            children: (
              <HistorySection
                downloadHistory={downloadHistory}
                clearDownloadHistory={clearDownloadHistory}
              />
            ),
          },
        ]}
      />
      
      {/* 加载状态 */}
      {(isSearching || isParsingPlaylist) && (
        <div className="loading-container">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', color: '#1890ff', marginBottom: '16px' }}>
              {isSearching ? '正在搜索音乐...' : '正在解析播放列表...'}
            </div>
          </div>
        </div>
      )}
      
      {/* 搜索结果 */}
      {!isSearching && !isParsingPlaylist && searchResults.length > 0 && (
        <SongList
          searchResults={searchResults}
          selectedSongs={selectedSongs}
          handleSongSelect={handleSongSelect}
          handleSelectAll={handleSelectAll}
          handleDownload={handleDownload}
          isDownloading={isDownloading}
        />
      )}
      
      {/* 空状态 */}
      {!isSearching && !isParsingPlaylist && searchResults.length === 0 && (
        <div className="empty-container">
          <div style={{ fontSize: '16px', color: '#999' }}>
            {keyword || playlistUrl ? '未找到相关歌曲，请尝试其他关键词或音乐源' : '请输入关键词搜索音乐或解析播放列表'}
          </div>
        </div>
      )}
      
      {/* 下载进度弹窗 */}
      <Modal
        title="下载进度"
        open={isDownloading}
        footer={null}
        closable={false}
        centered
        width={500}
      >
        <Progress 
          percent={downloadProgress} 
          status="active" 
          strokeWidth={10}
          format={(percent) => `${percent}%`}
        />
        <p style={{ marginTop: 24, textAlign: 'center', fontSize: '16px', color: '#333' }}>
          {downloadProgress < 100 ? '正在下载...' : '下载完成!'}
        </p>
        {downloadProgress === 100 && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Button 
              type="primary" 
              onClick={() => setIsDownloading(false)}
              size="large"
            >
              确定
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default App;