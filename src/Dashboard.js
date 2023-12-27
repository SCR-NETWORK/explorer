import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import { useState } from 'react';
import { Button, Col, Container, Form, InputGroup, Modal, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import './App.scss';
import BalanceModal from './components/BalanceModal';
import BlockDAGBox from './components/BlockDAG';
import BlockOverview from './components/BlockOverview';
import CoinsupplyBox from './components/CoinsupplyBox';
import PyipadInfoBox from './components/PyipadInfoBox';
import MarketDataBox from './components/MarketDataBox';
import TxOverview from './components/TxOverview';
import { getBlock } from './pyipad-api-client';




function Dashboard() {

  const [show, setShow] = useState(false);
  const navigate = useNavigate()

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [showLoadingModal, setShowLoadingModal] = useState(false)

  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("pyrin:");

  const search = (e) => {
    e.preventDefault();
    const v = e.target.searchInput.value

    setShowLoadingModal(true);

    if (v.length == 64) {
      getBlock(v).then(
        data => {
          if (data.detail == "Block not found") {
            navigate(`/txs/${v}`)
          }
          else {
            navigate(`/blocks/${v}`)
          }
        }
      ).catch((err) => {
        console.log("hier")
      })
    }

    if (v.startsWith("pyrin:")) {
      navigate(`/addresses/${v}`)
    }

    setShowLoadingModal(false);

  }


  //<Button variant="primary">Go!</Button>
  return (
    <div>
      <Modal show={showLoadingModal} animation={false} centered>
        <Modal.Body className="d-flex flex-row justify-content-center" style={{backgroundColor: "#0f0f12"}}>
          <Spinner animation="border" variant="primary" size="xl" /></Modal.Body>
      </Modal>
      <div className="row1">
        <Container className="firstRow webpage" fluid>
          <Row>
            <Col xs={11}>
              <Form onSubmit={search}>
                <InputGroup className="ms-md-5 mt-5 me-5 dashboard-search-box">
                  <Form.Control className="text-light shadow-none" name="searchInput" type="text" placeholder="Search for pyrin:address or block" />
                  <Button type="submit" className="shadow-none searchButton">search</Button>
                </InputGroup>
              </Form>
            </Col>
          </Row>
        </Container>

      </div>
      <div className="row2">
        <Container className="secondRow webpage" fluid>
          <Row>
            <Col sm={12} md={6} xl={3}><div className="infoBox">
              <CoinsupplyBox />
            </div></Col>
            <Col sm={12} md={6} xl={3}><div className="infoBox"><BlockDAGBox /></div></Col>
            <Col sm={12} md={6} xl={3}><div className="infoBox"><PyipadInfoBox /></div></Col>
            <Col sm={12} md={6} xl={3}><div className="infoBox"><MarketDataBox /></div></Col>
          </Row>
        </Container>
      </div>
      <div className="row4">
        <Container className="fourthRow webpage" fluid>
          <Row>
            <Col className="" xs={12} lg={6}><BlockOverview lines={20} small/></Col>
            <Col className="mt-5 mt-lg-0"  xs={12} lg={6}><TxOverview lines={20}  /></Col>
          </Row>
        </Container>
      </div>
      <BalanceModal handleClose={handleClose} show={show} address={address} balance={balance} />
    </div>

  );
}

export default Dashboard;
