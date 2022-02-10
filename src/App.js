import { Buttonm, IconButton, TextField } from '@material-ui/core';
import { Assignment, Phone } from '@material-ui/icons';
import { useEffect, useRef, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Peer from 'simple-peer';
import { io } from 'socket.io-client';
//css that I may turn to module.css later:
import './App.css';

const socket = io.connect('http://localhost:3500'); //running this backend on 3500;



function App() {
	const [ me, setMe ] = useState("");
	const [ stream, setStream ] = useState();
	const [ receivingCall, setReceivingCall ] = useState(false);
	const [ caller, setCaller ] = useState("");
	const [ callerSignal, setCallerSignal ] = useState();
	const [ callAccepted, setCallAccepted ] = useState(false);
	const [ idToCall, setIdToCall ] = useState("");
	const [ callEnded, setCallEnded] = useState(false);
	const [ name, setName ] = useState("");
  //getting all necessary refs:
	const myVideo = useRef();
	const userVideo = useRef();
  //disconnecting when ending call set:
	const connectionRef = useRef();

  useEffect(() => {

    navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(stream => {
      setStream(stream);
      myVideo.current.srcObject = stream;
    });

    socket.on('me', (id) => {
      setMe(id);
    });

    socket.on('callUser', (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

  }, []);
    //set up for calling a user:
    const callUser = (id) => {
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream
      });

      peer.on('signal', (data) => {
        socket.emit('callUser', {
          userToCall: id,
          signalData: data,
          from: me,
          name: name
        });
      });

      peer.on('stream', (stream) => {
        userVideo.current.srcObject = stream;
      });

      socket.on('callAccepted', (signal) => {
        setCallAccepted(true);
        peer.signal(signal);
      });
      
      connectionRef.current = peer;

    };

    //set up for answering a call:
    const answerCall = () => {

      setCallAccepted(true);
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: stream
      });

      

    };

  return (
    <div className="App">

    </div>
  );
}

export default App;
