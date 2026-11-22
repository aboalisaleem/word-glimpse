import { useState, useEffect, useRef, useCallback } from 'react';
import socket from '../socket';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export default function useVoiceChat(roomCode, isInActiveRoom) {
  const [isVoiceJoined, setIsVoiceJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceError, setVoiceError] = useState('');

  const localStreamRef = useRef(null);
  const peersRef = useRef({});
  const audioElementsRef = useRef({});
  const isJoinedRef = useRef(false);

  const cleanupPeer = useCallback((peerId) => {
    if (peersRef.current[peerId]) {
      peersRef.current[peerId].close();
      delete peersRef.current[peerId];
    }
    if (audioElementsRef.current[peerId]) {
      audioElementsRef.current[peerId].srcObject = null;
      audioElementsRef.current[peerId].remove();
      delete audioElementsRef.current[peerId];
    }
  }, []);

  const leaveVoice = useCallback(() => {
    if (isJoinedRef.current) {
      socket.emit('voice_leave');
    }
    isJoinedRef.current = false;
    setIsVoiceJoined(false);
    setIsMuted(false);

    Object.keys(peersRef.current).forEach(cleanupPeer);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
  }, [cleanupPeer]);

  const createPeerConnection = useCallback(
    (peerId, isInitiator) => {
      if (peersRef.current[peerId]) {
        return peersRef.current[peerId];
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peersRef.current[peerId] = pc;

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('voice_signal', {
            targetId: peerId,
            signal: { candidate: event.candidate }
          });
        }
      };

      pc.ontrack = (event) => {
        let audio = audioElementsRef.current[peerId];
        if (!audio) {
          audio = document.createElement('audio');
          audio.autoplay = true;
          audio.playsInline = true;
          document.body.appendChild(audio);
          audioElementsRef.current[peerId] = audio;
        }
        audio.srcObject = event.streams[0];
        audio.play().catch(() => {});
      };

      pc.onconnectionstatechange = () => {
        if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
          cleanupPeer(peerId);
        }
      };

      if (isInitiator) {
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            socket.emit('voice_signal', {
              targetId: peerId,
              signal: { sdp: pc.localDescription }
            });
          })
          .catch(() => {});
      }

      return pc;
    },
    [cleanupPeer]
  );

  const joinVoice = useCallback(async () => {
    if (!roomCode || isJoinedRef.current) return;
    setVoiceError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      localStreamRef.current = stream;
      isJoinedRef.current = true;
      setIsVoiceJoined(true);
      setIsMuted(false);

      socket.emit('voice_join', { roomCode });
    } catch {
      setVoiceError('Microphone access denied. Allow mic permission to join voice.');
    }
  }, [roomCode]);

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;
    setIsMuted(!audioTrack.enabled);
  }, []);

  useEffect(() => {
    const handleVoicePeers = ({ peers }) => {
      if (!isJoinedRef.current) return;
      (peers || []).forEach((peerId) => {
        createPeerConnection(peerId, true);
      });
    };

    const handleVoiceSignal = async ({ fromId, signal }) => {
      if (!isJoinedRef.current || !fromId || !signal) return;

      const pc = createPeerConnection(fromId, false);
      try {
        if (signal.sdp) {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          if (signal.sdp.type === 'offer') {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('voice_signal', {
              targetId: fromId,
              signal: { sdp: pc.localDescription }
            });
          }
        } else if (signal.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch {
        // Ignore transient ICE/SDP race errors
      }
    };

    const handlePeerLeft = ({ peerId }) => {
      cleanupPeer(peerId);
    };

    socket.on('voice_peers', handleVoicePeers);
    socket.on('voice_signal', handleVoiceSignal);
    socket.on('voice_peer_left', handlePeerLeft);

    return () => {
      socket.off('voice_peers', handleVoicePeers);
      socket.off('voice_signal', handleVoiceSignal);
      socket.off('voice_peer_left', handlePeerLeft);
    };
  }, [createPeerConnection, cleanupPeer]);

  useEffect(() => {
    if (!isInActiveRoom && isJoinedRef.current) {
      leaveVoice();
    }
  }, [isInActiveRoom, leaveVoice]);

  useEffect(() => {
    return () => {
      leaveVoice();
    };
  }, [leaveVoice]);

  return {
    isVoiceJoined,
    isMuted,
    voiceError,
    joinVoice,
    leaveVoice,
    toggleMute
  };
}