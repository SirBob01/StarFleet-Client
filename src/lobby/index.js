import React, { useEffect, useState } from "react";
import styled from "styled-components";
import dynamo from "dynamojs-engine";
import { Redirect, useParams } from "react-router";

const Display = styled.canvas`
    width: 100%;
    height: 100%;
    overflow: hidden;
`;

export default function Lobby({ socket }) {
    const { lobbyKey } = useParams();
    const [returnHome, setReturnHome] = useState(false);

    useEffect(() => {
        socket.emit('join', lobbyKey, success => {
            if (!success) {
                alert('Game does not exist with this key!');
                setReturnHome(true);
            }
        });
    }, [])

    if(returnHome) return <Redirect to='/'/>;
    return (
        <Display id="display"/>
    )
}