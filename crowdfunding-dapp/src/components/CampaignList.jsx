import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig'

export default function CampaignList() {
    const [campaigns, setCampaigns] = useState([])

    const loadCampaigns = async () => {
        if (!window.ethereum) return alert('MetaMask non installé')
        const provider = new ethers.BrowserProvider(window.ethereum)
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
        const count = await contract.campaignCount()

        const temp = []
        for (let i = 0; i < count; i++) {
            const c = await contract.campaigns(i)
            temp.push({
                id: i,
                title: c[0],
                description: c[1],
                image: c[2], // <-- ajouter l'image
                owner: c[3],
                goal: c[4],
                deadline: c[5],
                amountRaised: c[6],
                fundsWithdrawn: c[7],
            })
        }

        setCampaigns(temp)
    }

    useEffect(() => {
        loadCampaigns()
    }, [])

    const safeFormatEther = value => {
        try {
            return value ? ethers.formatEther(value) : '0'
        } catch (e) {
            console.error('Erreur formatEther:', value, e)
            return '0'
        }
    }

    return (
        <div className='max-w-7xl mx-auto'>
            <h2 className="text-2xl font-bold mb-10">Liste des campagnes</h2>
            <div className="grid gap-6 grid-cols-3">
                {campaigns.map(c => (
                    <div className="card bg-base-100 w-96 shadow-xl" key={c.id}>
                        <figure>
                            <img className='w-full' src={c.image} alt={c.title} />
                        </figure>
                        <div className="card-body">
                            <h2 className="card-title"> {c.title}</h2>
                            <p className="text-gray-700 font-medium">Objectif: {safeFormatEther(c.goal)} ETH</p>

                            <p className='text-gray-700 font-medium'>
                                Deadline:{' '}
                                {c.deadline
                                    ? new Date(Number(c.deadline) * 1000).toLocaleString()
                                    : 'N/A'}
                            </p>

                            <div className="card-actions justify-end">
                                <button className="btn btn-primary">Details</button>

                                <button className="btn btn-primary"> Contribute </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
