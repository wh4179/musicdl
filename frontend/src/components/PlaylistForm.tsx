import React from 'react';
import { Form, Input, Select, Button } from 'antd';

interface PlaylistFormProps {
  playlistUrl: string;
  setPlaylistUrl: (url: string) => void;
  selectedSources: string[];
  setSelectedSources: (sources: string[]) => void;
  musicSources: string[];
  handleParsePlaylist: () => void;
  isParsingPlaylist: boolean;
}

const { Option } = Select;

const PlaylistForm: React.FC<PlaylistFormProps> = ({
  playlistUrl,
  setPlaylistUrl,
  selectedSources,
  setSelectedSources,
  musicSources,
  handleParsePlaylist,
  isParsingPlaylist,
}) => {
  return (
    <div className="form-section">
      <Form layout="vertical" onFinish={handleParsePlaylist}>
        <Form.Item label="播放列表URL">
          <Input 
            placeholder="请输入播放列表URL" 
            value={playlistUrl} 
            onChange={(e) => setPlaylistUrl(e.target.value)} 
            size="large"
          />
        </Form.Item>
        
        <Form.Item label="音乐源">
          <Select
            mode="multiple"
            placeholder="请选择音乐源"
            style={{ width: '100%' }}
            value={selectedSources}
            onChange={setSelectedSources}
            size="large"
            maxTagCount={3}
          >
            {musicSources.map(source => (
              <Option key={source} value={source}>{source}</Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item>
          <Button 
            type="primary" 
            onClick={handleParsePlaylist} 
            loading={isParsingPlaylist}
            block
            size="large"
          >
            解析播放列表
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PlaylistForm;