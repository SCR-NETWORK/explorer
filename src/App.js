
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import { useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Form, InputGroup, Nav, Navbar, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { BiDonateHeart } from 'react-icons/bi';
import { FaGithub } from 'react-icons/fa';
import { SiFastapi } from 'react-icons/si';
import { useLocation, useNavigate } from 'react-router';
import { Link, NavLink, Route, Routes } from "react-router-dom";
import "react-toggle/style.css";
import io from 'socket.io-client';
import './App.scss';
import AddressInfoPage from './components/AddressInfo';
import BlockInfo from './components/BlockInfo';
import BlocksPage from './components/BlocksPage';
import BlueScoreContext from './components/BlueScoreContext';
import LastBlocksContext from './components/LastBlocksContext';
import NotFound from './components/NotFound';
import PriceContext from './components/PriceContext';
import TransactionInfo from './components/TransactionInfo';
import TxPage from './components/TxPage';
import Dashboard from './Dashboard';
import { getBlock } from './pyipad-api-client';
// import 'moment/min/locales';

// var locale = window.navigator.userLanguage || window.navigator.language || "en";
// moment.locale(locale);
// moment.locale('en');

const buildVersion = process.env.REACT_APP_VERCEL_GIT_COMMIT_SHA || "1.0.0"

const socket = io("wss://api.pyrintestnet.network", {
  path: '/ws/socket.io'
});

function App() {
  const [price, setPrice] = useState("")
  const [marketData, setMarketData] = useState("")

  const [blocks, setBlocks] = useState([]);
  const [blueScore, setBlueScore] = useState(0);
  const [isConnected, setIsConnected] = useState();

  const location = useLocation()
  const navigate = useNavigate()

  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;


  const search = async (e) => {
    e.preventDefault();
    const v = e.target.searchbox.value

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
    if (v.startsWith("pyipad:")) {
      navigate(`/addresses/${v}`)
    }

    e.target.searchbox.value = ""
  }

  const updatePrice = () => {
    fetch(`https://api.pyrintestnet.network/info/market-data`, {
      headers: { "Cache-Control": "no-cache" }
    })
      .then(response => response.json())
      .then(data => {
        setPrice(data['current_price']['usd'].toFixed(4));
        setMarketData(data);
      })
      .catch(r => console.log(r))
  }

  useEffect(() => {
    updatePrice()

    const intervalPrice = setInterval(() => {
      updatePrice()
    }, 60000);

    // socketio
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {

      setIsConnected(false);
    });

    socket.on('last-blocks', (e) => {
      setBlocks(e)
      socket.emit("join-room", "blocks")
    })

    socket.emit('last-blocks', "")

    socket.on('bluescore', (e) => {
      setBlueScore(e.blueScore)
    })
    console.log("join room bluescore")
    socket.emit("join-room", "bluescore")

    socket.on('new-block', (d) => {
      setBlocks([...blocksRef.current, d].slice(-100))
    });

    return () => {
      clearInterval(intervalPrice);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new-block');
    }
  }, [])


  const closeMenuIfNeeded = () => {
    if (document.getElementById("responsive-navbar-nav").classList.contains('show')) {
      document.getElementsByClassName("navbar-toggler")[0].click()
    }
  }


  //<Button variant="primary">Go!</Button>
  return (
    <LastBlocksContext.Provider value={{ blocks, isConnected }}>
      <PriceContext.Provider value={{ price, marketData }}>
        <BlueScoreContext.Provider value={{ blueScore }}>
          <div className="big-page">
            <Navbar expand="md" bg="dark" variant="dark" id="navbar_top">
              <Container id="navbar-container" fluid>
                <div className="navbar-title">
                  <Navbar.Brand >
                    <Link to="/">
                      <div className="navbar-brand">
                        <span>explorer.</span>
                        <img src="/pyrin.svg" style={{ "marginRight": ".5rem", width: "8rem"}} />
                        <span>.network</span>
                      </div>
                    </Link>
                  </Navbar.Brand>
                </div>

                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                  <Nav className="me-auto nav-items">
                    <Nav.Item><NavLink className="nav-link fs-5" onClick={closeMenuIfNeeded} to={"/"}>dashboard</NavLink></Nav.Item>
                    <Nav.Item><NavLink className="nav-link fs-5" onClick={closeMenuIfNeeded} to={"/blocks"}>blocks</NavLink></Nav.Item>
                    <Nav.Item><NavLink className="nav-link fs-5" onClick={closeMenuIfNeeded} to={"/txs"}>transactions</NavLink></Nav.Item>
                  </Nav>
                </Navbar.Collapse>
              </Container>
            </Navbar>
            <div className="search-row">
              <Container className="webpage" hidden={location.pathname == "/"}>
                <Row><Col xs={12}>
                  <Form onSubmit={search} className="">
                    <InputGroup className="mt-4 mb-4 search-box-group">
                      <Form.Control className="d-inline-block bg-light text-dark shadow-none" name="searchbox" id="search-box-high" type="text" placeholder="Search for pyipad:address or block" />
                      <Button type="submit" className="shadow-none searchButton" variant="dark">search</Button>
                    </InputGroup>
                  </Form>
                </Col></Row>
              </Container>
            </div>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/blocks" element={<BlocksPage />} />
              <Route path="/blocks/:id" element={<BlockInfo />} />
              <Route path="/blocks/:id/:txview" element={<BlockInfo />} />
              <Route path="/addresses/:addr" element={<AddressInfoPage />} />
              <Route path="/txs" element={<TxPage />} />
              <Route path="/txs/:id" element={<TransactionInfo />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            {/* <div className="alpha">ALPHA VERSION</div> */}
          </div>
        </BlueScoreContext.Provider>
      </PriceContext.Provider>
    </LastBlocksContext.Provider>

  );
}

export default App;
