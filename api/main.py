'''
Function:
    Implementation of MusicDL API Server
Author:
    Zhenchao Jin
WeChat Official Account (微信公众号):
    Charles的皮卡丘
'''
import os
import sys
import json
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from musicdl import musicdl
from musicdl.modules import MusicClientBuilder
from musicdl.modules.utils.data import SongInfo

'''models'''
class SearchRequest(BaseModel):
    keyword: str
    music_sources: Optional[List[str]] = None

class DownloadRequest(BaseModel):
    song_infos: List[Dict[str, Any]]

class PlaylistRequest(BaseModel):
    playlist_url: str
    music_sources: Optional[List[str]] = None

class ConfigRequest(BaseModel):
    music_sources: List[str]
    init_music_clients_cfg: Optional[Dict[str, Dict[str, Any]]] = None

'''app'''
app = FastAPI(
    title="MusicDL API",
    description="A lightweight music downloader API",
    version="1.0.0",
    timeout=60,  # 设置60秒超时
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, set specific frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

'''global variables'''
music_client = None

'''utils'''
def get_music_client(music_sources: Optional[List[str]] = None, init_music_clients_cfg: Optional[Dict[str, Dict[str, Any]]] = None):
    global music_client
    if music_client is None or (music_sources and music_client.music_sources != music_sources):
        music_client = musicdl.MusicClient(
            music_sources=music_sources or ['MiguMusicClient', 'NeteaseMusicClient', 'QQMusicClient', 'KuwoMusicClient', 'QianqianMusicClient'],
            init_music_clients_cfg=init_music_clients_cfg or {}
        )
    return music_client

'''routes'''
@app.get("/api/music-sources")
async def get_music_sources():
    """Get supported music sources"""
    return {"music_sources": list(MusicClientBuilder.REGISTERED_MODULES.keys())}

@app.post("/api/search")
async def search_music(request: SearchRequest):
    """Search music"""
    import time
    start_time = time.time()
    print(f"[SEARCH] Received request: keyword={request.keyword}, sources={request.music_sources}")
    
    try:
        client = get_music_client(music_sources=request.music_sources)
        # 设置搜索超时
        import asyncio
        results = await asyncio.to_thread(client.search, keyword=request.keyword)
        
        # Flatten results
        flat_results = []
        for source, items in results.items():
            for i, item in enumerate(items):
                # Convert to serializable format
                song_info = {}
                for key, value in item.__dict__.items():
                    if isinstance(value, (str, int, float, bool, type(None))):
                        song_info[key] = value
                    elif isinstance(value, dict):
                        song_info[key] = value
                    elif isinstance(value, list):
                        song_info[key] = value
                flat_results.append({"source": source, "index": i, "song_info": song_info})
        
        elapsed_time = time.time() - start_time
        print(f"[SEARCH] Completed in {elapsed_time:.2f}s, found {len(flat_results)} results")
        return {"results": flat_results}
    except Exception as e:
        elapsed_time = time.time() - start_time
        print(f"[SEARCH] Failed in {elapsed_time:.2f}s: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/download")
async def download_music(request: DownloadRequest):
    """Download music"""
    import time
    start_time = time.time()
    print(f"[DOWNLOAD] Received request: {len(request.song_infos)} songs")
    
    try:
        # Get unique music sources from song_infos
        music_sources = []
        for song_info in request.song_infos:
            if 'source' in song_info and song_info['source'] not in music_sources:
                music_sources.append(song_info['source'])
        
        print(f"[DOWNLOAD] Music sources: {music_sources}")
        
        # Use default music sources if none provided
        if not music_sources:
            music_sources = ['MiguMusicClient', 'NeteaseMusicClient', 'QQMusicClient', 'KuwoMusicClient', 'QianqianMusicClient']
            print(f"[DOWNLOAD] Using default music sources: {music_sources}")
        
        # Create music client
        client = get_music_client(music_sources=music_sources)
        print(f"[DOWNLOAD] Music client created successfully")
        
        # Convert dict to SongInfo objects
        song_info_objects = []
        for i, song_info_dict in enumerate(request.song_infos):
            # Create SongInfo object from dict
            song_info = SongInfo.fromdict(song_info_dict)
            # Set default values if missing
            if not song_info.work_dir:
                song_info.work_dir = 'musicdl_outputs'
            if not song_info.identifier:
                # Create a simple identifier from song name and source
                song_info.identifier = f"{song_info.song_name}-{song_info.source}"
            song_info_objects.append(song_info)
            print(f"[DOWNLOAD] Song {i}: {song_info.song_name} from {song_info.source}")
        
        # Download music (异步处理)
        import asyncio
        print("[DOWNLOAD] Starting download...")
        await asyncio.to_thread(client.download, song_infos=song_info_objects)
        print("[DOWNLOAD] Download completed successfully")
        
        elapsed_time = time.time() - start_time
        print(f"[DOWNLOAD] Completed in {elapsed_time:.2f}s")
        return {"ok": True}
    except Exception as e:
        # Log the error for debugging
        elapsed_time = time.time() - start_time
        print(f"[DOWNLOAD] Failed in {elapsed_time:.2f}s: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/parse-playlist")
async def parse_playlist(request: PlaylistRequest):
    """Parse playlist"""
    import time
    start_time = time.time()
    print(f"[PLAYLIST] Received request: url={request.playlist_url}, sources={request.music_sources}")
    
    try:
        client = get_music_client(music_sources=request.music_sources)
        # 异步处理播放列表解析
        import asyncio
        song_infos = await asyncio.to_thread(client.parseplaylist, playlist_url=request.playlist_url)
        
        # Convert to serializable format
        results = []
        for i, item in enumerate(song_infos):
            song_info = {}
            for key, value in item.__dict__.items():
                if isinstance(value, (str, int, float, bool, type(None))):
                    song_info[key] = value
                elif isinstance(value, dict):
                    song_info[key] = value
                elif isinstance(value, list):
                    song_info[key] = value
            results.append(song_info)
        
        elapsed_time = time.time() - start_time
        print(f"[PLAYLIST] Completed in {elapsed_time:.2f}s, found {len(results)} songs")
        return {"results": results}
    except Exception as e:
        elapsed_time = time.time() - start_time
        print(f"[PLAYLIST] Failed in {elapsed_time:.2f}s: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/config")
async def config_client(request: ConfigRequest):
    """Configure music client"""
    try:
        global music_client
        music_client = get_music_client(
            music_sources=request.music_sources,
            init_music_clients_cfg=request.init_music_clients_cfg
        )
        return {"ok": True, "music_sources": music_client.music_sources}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health check"""
    return {"status": "healthy"}

'''main'''
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
