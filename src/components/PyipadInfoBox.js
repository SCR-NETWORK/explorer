import { faMemory } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from "react";
import { FaMemory } from 'react-icons/fa';



const SCRpadInfoBox = () => {
    const [data, setData] = useState({});

    async function updateData() {
        await fetch('https://api.SCR.network/info/SCR')
            .then((response) => response.json())
            .then(d => setData(d))
            .catch(err => console.log("Error", err))
        setTimeout(updateData, 60000)
    }
    useEffect(() => {

        updateData()
    }, [])


    return <>
        <div className="cardBox mx-0">
            <table>
                <tr>
                    <td className="cardBoxElement">
                        Mempool size
                    </td>
                    <td className="">
                        {data.mempoolSize}
                    </td>
                </tr>
                <tr>
                    <td className="cardBoxElement">
                        Server version
                    </td>
                    <td className="">
                        {data.serverVersion}
                    </td>
                </tr>
            </table>
        </div>
    </>
}


export default SCRpadInfoBox