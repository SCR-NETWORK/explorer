import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import { useContext, useEffect, useState } from "react";
import { numberWithCommas } from "../helper";
import { getCoinSupply, getHalving } from '../SCR_Network-api-client';
import PriceContext from "./PriceContext";


const CBox = () => {
    const [circCoins, setCircCoins] = useState("-");
    const [blockReward, setBlockReward] = useState("-");
    const [halvingDate, setHalvingDate] = useState("-");
    const [halvingAmount, setHalvingAmount] = useState("-");

    const initBox = async () => {
        const coinSupplyResp = await getCoinSupply()
        getBlockReward();

        getHalving().then((d) => {
            setHalvingDate(moment(d.nextHalvingTimestamp * 1000).format("YYYY-MM-DD HH:mm"))
            setHalvingAmount(d.nextHalvingAmount.toFixed(2))
        })

        setCircCoins(Math.round(coinSupplyResp.circulatingSupply / 100000000))
    }

    useEffect(() => {
        initBox();

        const updateCircCoins = setInterval(async () => {

            const coinSupplyResp = await getCoinSupply()
            setCircCoins(Math.round(coinSupplyResp.circulatingSupply / 100000000))

        }, 10000)


        return async () => {
            clearInterval(updateCircCoins)
        };
    }, [])

    async function getBlockReward() {
        await fetch('https://api.SCR.network/info/blockreward')
            .then((response) => response.json())
            .then(d => {
                setBlockReward(d.blockreward.toFixed(2))

            })
            .catch(err => console.log("Error", err))
    }


    useEffect(() => {
        document.getElementById('coins').animate([
            // keyframes
            { opacity: '1' },
            { opacity: '0.6' },
            { opacity: '1' },
        ], {
            // timing options
            duration: 300
        });
    }, [circCoins])


    return <>
        <div className="cardBox mx-0">
            <table style={{ fontSize: "1rem" }}>
                <tr>
                    <td className="cardBoxElement align-top">
                        Total</td>
                    <td className="">
                        <div id="coins">{numberWithCommas(circCoins)} SCR
                        </div>
                    </td>
                </tr>
                <tr>
                    <td className="cardBoxElement align-top">Max <span className="approx">(approx.)</span></td>
                    <td className="pt-1">1,000,000,000 SCR</td>
                </tr>
                <tr>
                    <td className="cardBoxElement align-top">Mined</td>
                    <td className="pt-1">{(circCoins / 1000000000 * 100).toFixed(2)} %</td>
                </tr>
                <tr>
                    <td className="cardBoxElement align-top">Block reward</td>
                    <td className="pt-1">{blockReward} SCR</td>
                </tr>
                <tr>
                    <td className="cardBoxElement align-top">Reward reduction</td>
                    <td className="pt-1">{halvingDate}<br /><div className="text-end w-100 pe-3 pt-1" style={{ fontSize: "small" }}>to {halvingAmount} SCR</div></td>
                </tr>
            </table>
        </div>
    </>
}


export default CBox
