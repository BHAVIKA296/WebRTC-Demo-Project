import React, { useEffect, useCallback, useState } from 'react';
import { useSocket } from '../Providers/Socket';
import { usePeer } from '../Providers/Peer';
import ReactPlayer from 'react-player';

const RoomPage = () => {
	const { socket } = useSocket();
	const {
		peer,
		createOffer,
		createAnswer,
		setRemoteAnswer,
		sendStream,
		remoteStream,
	} = usePeer();

	const [myStream, setMYStream] = useState(null);
	const [remoteEmailId, setRemoteEmailId] = useState();

	const handleNewUserJoined = useCallback(
		async (data) => {
			const { emailId } = data;
			console.log('New user joined room', emailId);
			const offer = await createOffer();
			socket.emit('call-user', { emailId, offer });
			setRemoteEmailId(emailId);
		},
		[createOffer, socket]
	);

	const handleIncomingCall = useCallback(
		async (data) => {
			const { from, offer } = data;
			console.log('Incoming Call from', from, offer);
			const ans = await createAnswer(offer);
			socket.emit('call-accepted', { emailId: from, ans });
			setRemoteEmailId(from);
		},
		[createAnswer, socket]
	);

	const handleCallAccepted = useCallback(
		async (data) => {
			const { ans } = data;
			console.log('Call Got Accepted', ans);
			await setRemoteAnswer(ans);
		},
		[setRemoteAnswer, socket]
	);

	const handleNegotiation = useCallback(() => {
		const localOffer = peer.localDescription;
		socket.emit('call-user', { emailId: remoteEmailId, offer: localOffer });
	}, [peer.localDescription, remoteEmailId, socket]);

	const getUserMediaStream = useCallback(async () => {
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: true,
			video: true,
		});
		setMYStream(stream);
	}, []);

	useEffect(() => {
		socket.on('user-joined', handleNewUserJoined);
		socket.on('incoming-call', handleIncomingCall);
		socket.on('call-accepted', handleCallAccepted);

		// return () => {
		// 	socket.off('user-joined', handleNewUserJoined);
		// 	socket.off('incoming-call', handleIncomingCall);
		//     socket.off('call-accepted', handleCallAccepted);
		// };
	}, [handleIncomingCall, handleNewUserJoined, handleCallAccepted, socket]);

	useEffect(() => {
		getUserMediaStream();
	}, [getUserMediaStream]);

	useEffect(() => {
		peer.addEventListener('negotiationneeded', handleNegotiation);

		return () => {
			peer.removeEventListener('negotiationneeded', handleNegotiation);
		};
	}, [handleNegotiation, peer]);
	return (
		<div className="room-page-Container">
			<h1>Room Page</h1>
			<h4>You are Connected to {remoteEmailId} </h4>
			<button onClick={(e) => sendStream(myStream)}>Share My Video</button>
			<ReactPlayer
				url={myStream}
				playing
			/>
			<ReactPlayer
				url={remoteStream}
				playing
			/>
		</div>
	);
};

export default RoomPage;
