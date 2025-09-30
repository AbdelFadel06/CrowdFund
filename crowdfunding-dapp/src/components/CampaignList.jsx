import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig'
import { useNavigate } from 'react-router-dom'

export default function CampaignList() {
    const formatTimestampToDate = timestamp => {
        if (!timestamp || timestamp === 0) return 'N/A'

        // Debug du timestamp reçu
        console.log(`Timestamp reçu: ${timestamp}, Type: ${typeof timestamp}`)

        const date = new Date(Number(timestamp) * 1000)

        // Debug de la conversion
        console.log(`Date convertie: ${date.toLocaleString('fr-FR')}`)

        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
    }

    // 🔹 Fonction pour vérifier si une campagne est terminée
    const isCampaignEnded = deadlineTimestamp => {
        const now = Math.floor(Date.now() / 1000)
        const ended = Number(deadlineTimestamp) <= now
        console.log(`Deadline: ${deadlineTimestamp}, Now: ${now}, Ended: ${ended}`)
        return ended
    }

    const [campaigns, setCampaigns] = useState([])
    const [activeTab, setActiveTab] = useState('en-cours')
    const navigate = useNavigate()

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
            console.log(`Nombre total de campagnes: ${count}`)

            const temp = []

            for (let i = 0; i < count; i++) {
                const c = await contract.getCampaignInfo(i)

                // Debug des données de chaque campagne
                console.log(`Campagne ${i}:`, {
                    title: c.title,
                    deadline: c.deadline.toString(),
                    deadlineNumber: Number(c.deadline),
                    formattedDate: formatTimestampToDate(c.deadline)
                })

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
                console.log(`Nouvelle campagne créée - ID: ${campaignId}, Deadline: ${deadline}`)

                const c = await contract.getCampaignInfo(campaignId)

                setCampaigns(prev => {
                    const map = new Map()
                    prev.forEach(camp => map.set(camp.id, camp))
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
                console.error("Erreur lors de l'ajout de la nouvelle campagne:", err)
            }
        }

        contract.on('CampaignCreated', handleNewCampaign)

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

    // 🔹 Calculer le pourcentage de progression
    const calculateProgress = (amountRaised, goal) => {
        try {
            const raised = parseFloat(ethers.formatEther(amountRaised || 0))
            const target = parseFloat(ethers.formatEther(goal || 1))
            const progress = (raised / target) * 100
            return Math.min(progress, 100)
        } catch (e) {
            return 0
        }
    }

    // 🔹 Filtrer les campagnes selon l'onglet actif
    const filteredCampaigns = campaigns.filter(campaign => {
        const now = Math.floor(Date.now() / 1000)
        const deadline = Number(campaign.deadline)

        console.log(`Filtrage - Campagne "${campaign.title}": Deadline ${deadline}, Now ${now}, En cours: ${deadline > now}`)

        if (activeTab === 'en-cours') {
            return deadline > now
        } else {
            return deadline <= now
        }
    })

    // 🔹 Vérifier si l'objectif est atteint pour les campagnes terminées
    const isGoalReached = campaign => {
        const amountRaised = BigInt(campaign.amountRaised || 0)
        const goal = BigInt(campaign.goal || 0)
        return amountRaised >= goal
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="relative mb-12">
                <img
                    src="bg2.jpg"
                    alt="Opportunités de crowdfunding"
                    className="w-full h-144 object-cover rounded-lg shadow-lg"
                />
                <div className="absolute inset-0 bg-black/40 flex items-end justify-center"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-700 text-center px-4 bottom-5 mb-20">
                Participez aux campagnes et soutenez des projets innovants !
            </h1>

            {/* 🔹 Onglets de navigation */}
            <div className="flex justify-center mb-10">
                <div className="tabs tabs-boxed bg-white shadow-md">
                    <button
                        className={`tab tab-lg ${
                            activeTab === 'en-cours'
                                ? 'tab-active font-bold underline underline-offset-4'
                                : ''
                        }`}
                        onClick={() => setActiveTab('en-cours')}
                    >
                        🟢 En Cours
                    </button>
                    <button
                        className={`tab tab-lg ${
                            activeTab === 'termine'
                                ? 'tab-active font-bold underline underline-offset-4'
                                : ''
                        }`}
                        onClick={() => setActiveTab('termine')}
                    >
                        🔴 Terminé
                    </button>
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-10 text-gray-700 text-center">
                {activeTab === 'en-cours' ? 'Campagnes en Cours' : 'Campagnes Terminées'}
                <small className="block text-sm text-gray-500 mt-2">
                    ({filteredCampaigns.length} campagne(s))
                </small>
            </h2>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
                {filteredCampaigns.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                        <p className="text-gray-500 text-lg">
                            {activeTab === 'en-cours'
                                ? 'Aucune campagne en cours pour le moment.'
                                : 'Aucune campagne terminée pour le moment.'}
                        </p>
                    </div>
                ) : (
                    filteredCampaigns.map(c => {
                        const isTerminated = activeTab === 'termine'
                        const goalReached = isTerminated ? isGoalReached(c) : false
                        const progress = calculateProgress(c.amountRaised, c.goal)

                        return (
                            <div
                                className="card bg-base-100 w-96 h-[450px] shadow-xl flex flex-col hover:shadow-2xl transition-shadow duration-300"
                                key={c.id}
                            >
                                <figure className="h-48 overflow-hidden">
                                    <img
                                        className="w-full h-full object-cover"
                                        src={c.image}
                                        alt={c.title}
                                        onError={e => {
                                            e.target.src = '/default-campaign.jpg'
                                        }}
                                    />
                                </figure>
                                <div className="card-body flex flex-col justify-between p-4">
                                    <div>
                                        <h2 className="card-title text-lg mb-3">{c.title}</h2>

                                        {/* 🔹 Barre de progression */}
                                        <div className="mb-3">
                                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                <span>{progress.toFixed(1)}%</span>
                                                <span>
                                                    {safeFormatEther(c.amountRaised)} ETH /{' '}
                                                    {safeFormatEther(c.goal)} ETH
                                                </span>
                                            </div>
                                            <progress
                                                className={`progress w-full h-3 ${
                                                    isTerminated
                                                        ? goalReached
                                                            ? 'progress-success'
                                                            : 'progress-error'
                                                        : 'progress-primary'
                                                }`}
                                                value={progress}
                                                max="100"
                                            ></progress>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-gray-700 font-medium text-sm">
                                                ⏰ {isTerminated ? 'Terminé le:' : 'Deadline:'}{' '}
                                                {c.deadline && c.deadline !== 0
                                                    ? formatTimestampToDate(c.deadline)
                                                    : 'N/A'}
                                            </p>
                                            {isTerminated && (
                                                <p
                                                    className={`font-bold text-sm ${
                                                        goalReached
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                    }`}
                                                >
                                                    {goalReached
                                                        ? '✅ Objectif Atteint'
                                                        : '❌ Objectif Non Atteint'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="card-actions justify-end mt-4">
                                        <button
                                            onClick={() => navigate(`/campaign/${c.id}`)}
                                            className="btn btn-outline btn-primary btn-sm"
                                        >
                                            Détails
                                        </button>
                                        {isTerminated ? (
                                            <button
                                                className="btn btn-secondary btn-sm cursor-not-allowed"
                                                disabled
                                            >
                                                Terminé
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    navigate(`/campaign/${c.id}/contribute`)
                                                }
                                                className="btn btn-primary btn-sm"
                                            >
                                                Contribuer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
