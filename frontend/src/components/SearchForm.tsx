import React from 'react';
import { Form, Input, Select, Button, Tag } from 'antd';

interface SearchFormProps {
  keyword: string;
  setKeyword: (keyword: string) => void;
  selectedSources: string[];
  setSelectedSources: (sources: string[]) => void;
  musicSources: string[];
  handleSearch: () => void;
  isSearching: boolean;
  searchHistory: {
    keyword: string;
    timestamp: number;
  }[];
  clearSearchHistory: () => void;
  selectFromSearchHistory: (keyword: string) => void;
}

const { Option } = Select;

const SearchForm: React.FC<SearchFormProps> = ({
  keyword,
  setKeyword,
  selectedSources,
  setSelectedSources,
  musicSources,
  handleSearch,
  isSearching,
  searchHistory,
  clearSearchHistory,
  selectFromSearchHistory,
}) => {
  return (
    <div className="form-section">
      <Form layout="vertical" onFinish={handleSearch}>
        <Form.Item label="搜索关键词">
          <Input 
            placeholder="请输入歌曲名、歌手名或专辑名" 
            value={keyword} 
            onChange={(e) => setKeyword(e.target.value)} 
            onPressEnter={handleSearch}
            size="large"
          />
        </Form.Item>
        
        {/* 搜索历史 */}
        {searchHistory.length > 0 && (
          <div className="history-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h4 style={{ margin: 0, fontSize: 14, color: '#666' }}>搜索历史</h4>
              <Button type="link" size="small" onClick={clearSearchHistory}>
                清除
              </Button>
            </div>
            <div className="history-tags">
              {searchHistory.map((item, index) => (
                <Tag 
                  key={index} 
                  onClick={() => selectFromSearchHistory(item.keyword)}
                  style={{ marginBottom: 8, cursor: 'pointer' }}
                >
                  {item.keyword}
                </Tag>
              ))}
            </div>
          </div>
        )}
        
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
            onClick={handleSearch} 
            loading={isSearching}
            block
            size="large"
          >
            搜索
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SearchForm;