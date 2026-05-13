import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AgoraUIKit from 'agora-react-uikit';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const LiveClass = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    const [rtcProps, setRtcProps] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initRoom = async () => {
            try {
                // Fetch dynamic Agora token from backend using the provided logic
                const res = await api.get(`/meetings/${roomId}/token`);
                if (res.data.success) {
                    setRtcProps({
                        appId: res.data.appID,
                        channel: res.data.channelName,
                        token: res.data.token,
                        uid: 0, // 0 lets Agora assign a unique ID automatically
                    });
                }
            } catch (err) {
                console.error("Agora token fetch failed:", err);
                setError(err.response?.data?.message || "Failed to initialize Live Session token.");
            }
        };

        if (roomId) initRoom();
    }, [roomId]);

    const callbacks = {
        EndCall: () => {
            navigate('/dashboard');
        },
    };

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center p-6 text-center bg-slate-900 w-full relative">
                 <Link to="/dashboard" className="absolute top-4 left-4 z-50 px-4 py-2 bg-slate-800/80 backdrop-blur text-white text-sm font-medium border border-slate-700 hover:bg-slate-700 transition rounded-lg flex items-center gap-2 shadow-lg">
                    <ArrowLeft size={16} /> Dashboard
                </Link>
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-lg shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
                    <div className="flex justify-center mb-6">
                        <div className="h-20 w-20 bg-rose-500/10 text-rose-500 flex items-center justify-center rounded-full">
                            <AlertCircle size={40} />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Agora Service Error</h2>
                    <p className="text-slate-400 mb-6 font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return rtcProps ? (
        <div className="flex w-screen h-screen">
            <AgoraUIKit 
                rtcProps={rtcProps} 
                callbacks={callbacks} 
                styleProps={{
                    localBtnContainer: { backgroundColor: '#0f172a' },
                }}
            />
        </div>
    ) : (
        <div className="flex items-center justify-center h-screen bg-slate-900 w-full">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white font-medium">Securing Agora WebRTC Connection...</p>
            </div>
        </div>
    );
};

export default LiveClass;
