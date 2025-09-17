import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig'
import { useNavigate } from 'react-router-dom'

export default function CampaignList() {
    const [campaigns, setCampaigns] = useState([])

    // 🔹 Fonction pour charger toutes les campagnes existantes
    const loadCampaigns = async () => {
        if (!window.ethereum) return alert('MetaMask non installé')

        try {
            const provider = new ethers.BrowserProvider(window.ethereum)
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

            const code = await provider.getCode(CONTRACT_ADDRESS)
            if (code === '0x') {
                console.error('❌ Aucun contrat déployé à cette adresse !')
                return
            }

            const count = await contract.campaignCount()
            const temp = []

            for (let i = 0; i < count; i++) {
                const c = await contract.getCampaignInfo(i)
                temp.push({
                    id: i,
                    title: c.title,
                    description: c.description,
                    image: c.image,
                    owner: c.campaignOwner,
                    goal: c.goal,
                    deadline: c.deadline,
                    amountRaised: c.amountRaised,
                    fundsWithdrawn: c.fundsWithdrawn,
                })
            }

            setCampaigns(temp)
        } catch (err) {
            console.error('Erreur loadCampaigns:', err)
        }
    }

    useEffect(() => {
        if (!window.ethereum) return

        const provider = new ethers.BrowserProvider(window.ethereum)
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

        // 1️⃣ Charge les campagnes existantes
        loadCampaigns()

        // 2️⃣ Gestion des nouvelles campagnes via l'événement
        const handleNewCampaign = async (campaignId, title, description, owner, goal, deadline) => {
            try {
                const c = await contract.getCampaignInfo(campaignId)

                setCampaigns(prev => {
                    const map = new Map()
                    // Ajoute les campagnes existantes
                    prev.forEach(camp => map.set(camp.id, camp))
                    // Ajoute ou remplace la nouvelle campagne
                    map.set(Number(campaignId), {
                        id: Number(campaignId),
                        title,
                        description,
                        image: c.image,
                        owner,
                        goal,
                        deadline,
                        amountRaised: c.amountRaised,
                        fundsWithdrawn: c.fundsWithdrawn,
                    })
                    return Array.from(map.values())
                })
            } catch (err) {
                console.error('Erreur lors de l’ajout de la nouvelle campagne:', err)
            }
        }

        contract.on('CampaignCreated', handleNewCampaign)

        // 🔹 Cleanup à la destruction du composant
        return () => {
            contract.off('CampaignCreated', handleNewCampaign)
        }
    }, [])

    const safeFormatEther = value => {
        try {
            return value ? ethers.formatEther(value) : '0'
        } catch (e) {
            console.error('Erreur formatEther:', value, e)
            return '0'
        }
    }

    const navigate = useNavigate()

    return (
        <div className="max-w-7xl mx-auto">
            <div className="relative mb-12">
                <img
                    src="bg2.jpg" // image large pour la landing
                    alt="Opportunités de crowdfunding"
                    className="w-full h-144 object-cover rounded-lg shadow-lg"
                />
                <div className="absolute inset-0 bg-black/40 flex items-end  justify-center"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-700 text-center px-4 bottom-5 mb-20">
                Participez aux campagnes et soutenez des projets innovants !
            </h1>

            <h2 className="text-3xl font-bold mb-10 text-gray-700 underline underline-offset-8">
                Liste des campagnes
            </h2>
            <div className="grid gap-6 grid-cols-3">
                {campaigns.map(c => (
                    <div
                        className="card bg-base-100 w-96 h-[500px] shadow-xl flex flex-col"
                        key={c.id}
                    >
                        <figure className="h-75 overflow-hidden">
                            <img
                                className="w-full h-full object-cover"
                                src={c.image}
                                alt={c.title}
                            />
                        </figure>
                        <div className="card-body flex flex-col justify-between">
                            <div>
                                <h2 className="card-title">{c.title}</h2>
                                <p className="text-gray-700 font-medium">
                                    Objectif: {safeFormatEther(c.goal)} ETH
                                </p>
                                <p className="text-gray-700 font-medium">
                                    Deadline:{' '}
                                    {c.deadline
                                        ? new Date(Number(c.deadline) * 1000).toLocaleString()
                                        : 'N/A'}
                                </p>
                            </div>
                            <div className="card-actions justify-end mt-2">
                                <button
                                    onClick={() => navigate(`/campaign/${c.id}`)}
                                    className="btn btn-primary"
                                >
                                    Details
                                </button>
                                <button
                                    onClick={() => navigate(`/campaign/${c.id}/contribute`)}
                                    className="btn btn-primary"
                                >
                                    Contribute
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
