import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { io } from 'socket.io-client';
import { FiMessageSquare, FiFileText, FiClock, FiVideo, FiMic, FiPhoneOff, FiCpu, FiSend } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import './InterviewRoom.css';

const InterviewRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const videoContainerRef = useRef(null);
  const socketRef = useRef(null);

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  // Real-time Chat
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // chat or notepad
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerName, setPartnerName] = useState('Peer');

  // Synced Notepad
  const [notes, setNotes] = useState('');

  // Synced Timer
  const [time, setTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerIntervalRef = useRef(null);

  // Zego state
  const zegoInstanceRef = useRef(null);

  useEffect(() => {
    // 1. Fetch Interview details by Room ID
    const initRoom = async () => {
      try {
        const { data } = await api.get(`/api/peer-interviews/room/${roomId}`);
        setInterview(data.interview);

        const isInterviewer = data.interview.interviewer._id === user._id;
        const otherPeer = isInterviewer ? data.interview.candidate : data.interview.interviewer;
        setPartnerName(otherPeer?.name || 'Peer');

        // 2. Fetch Zegocloud Credentials
        const credRes = await api.get('/api/peer-interviews/credentials');
        const { appId, serverSecret } = credRes.data;

        // 3. Initialize Zegocloud UIKit
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          Number(appId),
          String(serverSecret).trim(),
          String(roomId),
          String(user._id),
          String(user.name)
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zegoInstanceRef.current = zp;

        zp.joinRoom({
          container: videoContainerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.ScenarioOneONoneCall,
          },
          showScreenSharingButton: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showUserList: false,
          maxUsers: 2,
          layout: ZegoUIKitPrebuilt.Grid,
          showLeavingView: false, // we will handle exiting with our own button
        });

      } catch (err) {
        console.error(err);
        toast.error('Could not initialize interview room.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    initRoom();

    // 4. Initialize Socket.io Connection
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.emit('join-room', {
      roomId,
      userId: user._id,
      userName: user.name,
    });

    // Listen to real-time events
    socket.on('user-joined', ({ userName }) => {
      toast.success(`${userName} joined the room! 👋`);
    });

    socket.on('user-left', ({ userName }) => {
      toast.error(`${userName} left the room.`);
    });

    socket.on('receive-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('user-typing', ({ userId, isTyping }) => {
      if (userId !== user._id) {
        setPartnerTyping(isTyping);
      }
    });

    socket.on('notes-sync', (syncedNotes) => {
      setNotes(syncedNotes);
    });

    socket.on('timer-sync', ({ action, time: syncTime }) => {
      if (action === 'start') {
        setTime(syncTime);
        setTimerRunning(true);
      } else if (action === 'pause') {
        setTimerRunning(false);
      } else if (action === 'reset') {
        setTime(0);
        setTimerRunning(false);
      }
    });

    return () => {
      // Clean up timer
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      // Leave Zego room
      if (zegoInstanceRef.current) {
        try {
          zegoInstanceRef.current.destroy();
        } catch (e) {
          console.error(e);
        }
      }

      // Disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, user, navigate]);

  // Local Timer increment
  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerRunning]);

  // Send Chat Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const message = {
      text: inputText.trim(),
      senderId: user._id,
      senderName: user.name,
      timestamp: new Date().toISOString(),
    };

    socketRef.current.emit('send-message', { roomId, message });
    setInputText('');
    socketRef.current.emit('stop-typing', { roomId, userId: user._id });
  };

  // Typing state emit
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (e.target.value.length > 0) {
      socketRef.current.emit('typing', { roomId, userId: user._id, userName: user.name });
    } else {
      socketRef.current.emit('stop-typing', { roomId, userId: user._id });
    }
  };

  // Synced Notepad Change
  const handleNotesChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    socketRef.current.emit('notes-change', { roomId, notes: val });
  };

  // Sync Timer Action (Interviewer ONLY by UI, but we sync it)
  const emitTimerAction = (action) => {
    let targetTime = time;
    if (action === 'reset') targetTime = 0;

    setTimerRunning(action === 'start');
    if (action === 'reset') setTime(0);

    socketRef.current.emit('timer-action', {
      roomId,
      action,
      time: targetTime,
    });
  };

  const formatRoomTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleLeaveRoom = () => {
    if (window.confirm('Are you sure you want to exit the interview room?')) {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="room-loading">
        <div className="room-spinner" />
        <p>Connecting to mock interview room...</p>
      </div>
    );
  }

  const isUserInterviewer = interview?.interviewer?._id === user._id;

  return (
    <div className="room-page">
      {/* Top Bar Header */}
      <header className="room-header glass">
        <div className="room-header__left">
          <FiCpu className="icon-grad" size={20} />
          <span className="room-header__title">
            {interview?.interviewType?.toUpperCase()} Mock Round
          </span>
          <span className={`room-header__pill diff--${interview?.difficulty}`}>
            {interview?.difficulty}
          </span>
        </div>

        <div className="room-header__center">
          <div className="room-timer glass">
            <FiClock />
            <span>{formatRoomTime(time)}</span>
            {isUserInterviewer && (
              <div className="timer-controls">
                {!timerRunning ? (
                  <button onClick={() => emitTimerAction('start')} className="timer-btn timer-btn--start">Start</button>
                ) : (
                  <button onClick={() => emitTimerAction('pause')} className="timer-btn timer-btn--pause">Pause</button>
                )}
                <button onClick={() => emitTimerAction('reset')} className="timer-btn">Reset</button>
              </div>
            )}
          </div>
        </div>

        <div className="room-header__right">
          <button onClick={handleLeaveRoom} className="leave-room-btn">
            <FiPhoneOff size={16} />
            <span>End Call</span>
          </button>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="room-workspace">
        {/* Left Column: Zego Video Frame */}
        <div className="room-video-container glass-card" ref={videoContainerRef}>
          {/* Zegocloud mounts here */}
        </div>

        {/* Right Column: Chat and Collaborative Notepad */}
        <div className="room-sidebar glass-card">
          <div className="sidebar-tabs">
            <button
              className={`sidebar-tab ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <FiMessageSquare size={16} />
              <span>Chat Room</span>
            </button>
            <button
              className={`sidebar-tab ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              <FiFileText size={16} />
              <span>Shared Notes</span>
            </button>
          </div>

          <div className="sidebar-body">
            {/* CHAT PANEL */}
            {activeTab === 'chat' && (
              <div className="chat-panel">
                <div className="chat-messages">
                  {messages.length > 0 ? (
                    messages.map((msg, i) => {
                      const isOwn = msg.senderId === user._id;
                      return (
                        <div key={i} className={`chat-bubble-wrapper ${isOwn ? 'own' : 'other'}`}>
                          <span className="chat-bubble-sender">{msg.senderName}</span>
                          <div className="chat-bubble">{msg.text}</div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="chat-empty">
                      <p>💬 Welcome to the chat room. Send a message to get started.</p>
                    </div>
                  )}
                </div>

                {partnerTyping && (
                  <div className="typing-indicator-wrapper">
                    <span>{partnerName} is typing...</span>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="chat-input-form">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={handleInputChange}
                    className="chat-input glass"
                  />
                  <button type="submit" className="chat-send-btn">
                    <FiSend size={16} />
                  </button>
                </form>
              </div>
            )}

            {/* SHARED NOTEPAD PANEL */}
            {activeTab === 'notes' && (
              <div className="notepad-panel">
                <p className="notepad-desc">
                  📝 Collaborative scratchpad. Type notes, code, or feedback. Changes sync in real-time.
                </p>
                <textarea
                  className="notepad-textarea glass"
                  placeholder="Paste coding questions, write pseudo-code or note down key points..."
                  value={notes}
                  onChange={handleNotesChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
