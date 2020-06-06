import React, {useEffect, useState} from "react";
import {Col, Container, Row, Table} from "react-bootstrap";

function TopSearch() {
    const [top, setTop] = useState([]);

    useEffect( function() {
        fetch('https://websementique-server.herokuapp.com/get-top-searched', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => setTop(data))
            .catch(err => console.log(err));
    }, []);

    return (
        <Container id="top-search">
            <h3>Top Search</h3>
            <Table striped>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Count</th>
                </tr>
                </thead>
                <tbody>
                {top.map((element) => {
                    return (
                        <tr>
                            <td>{element.name}</td>
                            <td>{element.count}</td>
                        </tr>
                    )
                })}
                </tbody>
            </Table>
        </Container>
    )
}

export default TopSearch;
