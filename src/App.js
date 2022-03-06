import { Button, IconButton, TextField } from "@material-ui/core";
import { Assignment, Phone } from "@material-ui/icons";
import { useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import { io } from "socket.io-client";
import markUpStyles from "./App.module.css";
//css that I may turn to module.css later:
import "./App.css";

const socket = io.connect("http://localhost:3500"); //running this backend on 3500;

function App() {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  //getting all necessary refs:
  const myVideo = useRef();
  const userVideo = useRef();
  //disconnecting when ending call set:
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        myVideo.current.srcObject = stream;
      });

    socket.on("me", (id) => {
      setMe(id);
    });

    socket.on("callUser", (data) => {
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
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    socket.on("callAccepted", (signal) => {
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
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };
  //adding ability to leave the call:
  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  return (
<>

<div className="header">

{/* <!--MAIN CONTENT before waves--> */}
<div className="inner-header flex">
<section className="hero">
<h1>Connect</h1>
<p>~ Connecting the world one connection at a time ~</p>
  </section>
  <div className="container">
    <div className="video-container">
      <div className="video">
        {stream && (
          <video
            playsInline
            muted
            ref={myVideo}
            autoPlay
          />
        )}
      </div>
      <div className="video">
        {callAccepted && !callEnded ? (
          <video
            playsInline
            ref={userVideo}
            autoPlay
          />
        ) : null}
      </div>
    </div>
    <div className="myId">
      <TextField
        id="filled-basic"
        label="Name"
        variant="filled"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginBottom: "20px" }}
      />
      <CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Assignment fontSize="large" />}
        >
          Copy ID
        </Button>
      </CopyToClipboard>

      <TextField
        id="filled-basic"
        label="ID to call"
        variant="filled"
        value={idToCall}
        onChange={(e) => setIdToCall(e.target.value)}
      />
      <div className="call-button">
        {callAccepted && !callEnded ? (
          <Button variant="contained" color="secondary" onClick={leaveCall}>
            End Call
          </Button>
        ) : (
          <IconButton
            color="primary"
            aria-label="call"
            onClick={() => callUser(idToCall)}
          >
            <Phone fontSize="large" />
          </IconButton>
        )}
        {idToCall}
      </div>
    </div>
    <div>
      {receivingCall && !callAccepted ? (
        <div className="caller">
          <h1>{name} is calling...</h1>
          <Button variant="contained" color="primary" onClick={answerCall}>
            Answer
          </Button>
        </div>
      ) : null}
    </div>
  </div>
</div>

{/* <!--Waves Container--> */}
<div>
<svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
<defs>
<path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
</defs>
<g className="parallax">
<use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7" />
<use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
<use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
<use xlinkHref="#gentle-wave" x="48" y="7" fill="#fff" />
</g>
</svg>
</div>
{/* <!--Waves end--> */}

</div>
{/* <!--Header ends--> */}

{/* <!--FOOTER starts--> */}
<div className="content flex">
  <p className="footer">Connect &copy; 2022 </p>
</div>
{/* <!--FOOTER ends--> */}

</>
  );
}
export default App;
