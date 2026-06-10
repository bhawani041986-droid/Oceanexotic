import React from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

interface VideoCallModalProps {
  roomID: string;
  userName: string;
  userID: string;
  onClose: () => void;
}

export function VideoCallModal({ roomID, userName, userID, onClose }: VideoCallModalProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    // Hardcoded credentials for immediate functionality
    const appID = 1965621224;
    const serverSecret = "c441055133b191867d11992d5c04412b";

    if (!appID || !serverSecret) {
      console.error("ZegoCloud credentials missing.");
      return;
    }

    // Sanitize userID to ensure Zego accepts it
    const safeUserID = userID.replace(/[^a-zA-Z0-9]/g, '');

    // Generate Kit Token
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      safeUserID,
      userName
    );

    // Create instance object from Kit Token.
    const zp = ZegoUIKitPrebuilt.create(kitToken);

    // Start the call
    zp.joinRoom({
      container: containerRef.current,
      sharedLinks: [
        {
          name: 'Personal link',
          url:
           window.location.protocol + '//' + 
           window.location.host + window.location.pathname +
            '?roomID=' +
            roomID,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall, // 1-on-1 calls
      },
      onLeaveRoom: () => {
        onClose();
      },
    });

    return () => {
      if (zp) {
        zp.destroy();
      }
    };
  }, [roomID, userName, userID, onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <button 
        onClick={onClose}
        className="absolute top-4 left-4 z-[101] bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white font-bold backdrop-blur-md transition-colors"
      >
        Leave Call
      </button>
      <div className="w-full h-full" ref={containerRef} />
    </div>
  );
}
