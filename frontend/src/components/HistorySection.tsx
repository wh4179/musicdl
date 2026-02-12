import React from 'react';
import { Button, List, Tag } from 'antd';

interface DownloadHistoryItem {
  song_name: string;
  singers: string;
  timestamp: number;
  source: string;
  ext: string;
}

interface HistorySectionProps {
  downloadHistory: DownloadHistoryItem[];
  clearDownloadHistory: () => void;
}

const HistorySection: React.FC<HistorySectionProps> = ({
  downloadHistory,
  clearDownloadHistory,
}) => {
  return (
    <div className="form-section">
      {/* 下载历史 */}
      <div className="history-category">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>下载历史</h3>
          <Button type="link" onClick={clearDownloadHistory}>
            清除
          </Button>
        </div>
        {downloadHistory.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={downloadHistory}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <div>
                      <span>{item.song_name}</span>
                      <Tag style={{ marginLeft: 8, fontSize: 12, height: 20, lineHeight: '20px' }}>{item.ext}</Tag>
                    </div>
                  }
                  description={
                    <div>
                      <span>{item.singers}</span>
                      <span style={{ marginLeft: 16, color: '#999', fontSize: 12 }}>
                        {item.source}
                      </span>
                      <span style={{ marginLeft: 16, color: '#999', fontSize: 12 }}>
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            暂无下载历史
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorySection;