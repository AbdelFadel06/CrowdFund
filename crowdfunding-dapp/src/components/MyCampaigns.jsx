import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import CrowdFundingABI from '../CrowdFundingABI.json'
import { useNavigate } from 'react-router-dom'

const CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'

export default function MyCampaigns() {
    const [account, setAccount] = useState(null)
    const [campaigns, setCampaigns] = useState([])
    const [withdrawing, setWithdrawing] = useState({})
    const navigate = useNavigate()

    // 🔹 Connexion MetaMask
    useEffect(() => {
        const connectWallet = async () => {
            if (!window.ethereum) return alert('Installe MetaMask !')
            const provider = new ethers.BrowserProvider(window.ethereum)
            const accounts = await provider.send('eth_requestAccounts', [])
            setAccount(accounts[0])
        }
        connectWallet()
    }, [])

    // 🔹 Fonction pour retirer les fonds
    const withdrawFunds = async campaignId => {
        try {
            setWithdrawing(prev => ({ ...prev, [campaignId]: true }))
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner()
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CrowdFundingABI, signer)

            const tx = await contract.withdrawFunds(campaignId)
            await tx.wait()

            alert('✅ Fonds retirés avec succès !')
            // Recharger les données
            fetchCampaigns()
        } catch (err) {
            console.error('Erreur retrait:', err)
            alert('❌ Erreur lors du retrait des fonds')
        } finally {
            setWithdrawing(prev => ({ ...prev, [campaignId]: false }))
        }
    }

    // 🔹 Récupération des campagnes créées
    const fetchCampaigns = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner()
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CrowdFundingABI, signer)

            // IDs des campagnes créées par l'utilisateur
            const campaignIds = await contract.getMyCampaigns()

            const detailed = await Promise.all(
                campaignIds.map(async id => {
                    const [
                        title,
                        description,
                        image,
                        ,
                        goal,
                        deadline,
                        amountRaised,
                        fundsWithdrawn,
                    ] = await contract.getCampaignInfo(id)

                    const now = Math.floor(Date.now() / 1000)
                    const deadlineNumber = Number(deadline)
                    const daysLeft =
                        deadlineNumber > now
                            ? Math.ceil((deadlineNumber - now) / (60 * 60 * 24))
                            : 0

                    // Calcul de la progression
                    const progress = (Number(amountRaised) / Number(goal)) * 100
                    const isGoalReached = Number(amountRaised) >= Number(goal)
                    const isCampaignEnded = deadlineNumber <= now
                    const canWithdraw = isCampaignEnded && isGoalReached && !fundsWithdrawn

                    let status
                    if (fundsWithdrawn) {
                        status = '💰 Fonds retirés'
                    } else if (isCampaignEnded) {
                        status = isGoalReached ? '✅ Objectif atteint' : '❌ Objectif non atteint'
                    } else {
                        status = `${daysLeft} jours restants`
                    }

                    return {
                        campaignId: id.toString(),
                        title,
                        description,
                        image,
                        goal: ethers.formatEther(goal),
                        amountRaised: ethers.formatEther(amountRaised),
                        status,
                        progress: Math.min(progress, 100),
                        isGoalReached,
                        isCampaignEnded,
                        canWithdraw,
                        fundsWithdrawn,
                    }
                })
            )

            setCampaigns(detailed)
        } catch (err) {
            console.error('Erreur fetch campaigns:', err)
        }
    }

    useEffect(() => {
        if (!account) return
        fetchCampaigns()
    }, [account])

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/')}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                    ← Retour à l'accueil
                </button>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes Campagnes</h1>
            {!account ? (
                <p className="text-gray-600">Connectez MetaMask pour voir vos campagnes.</p>
            ) : campaigns.length === 0 ? (
                <p className="text-gray-600">Aucune campagne créée pour le moment.</p>
            ) : (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {campaigns.map((c, idx) => (
                        <div
                            key={idx}
                            className="bg-white shadow-lg rounded-2xl overflow-hidden flex flex-col h-[500px]"
                        >
                            <img
                                src={c.image}
                                alt={c.title}
                                className="w-full h-48 object-cover"
                                onError={e => {
                                    e.target.src = '/default-campaign.jpg'
                                }}
                            />
                            <div className="p-4 flex flex-col flex-grow justify-between">
                                <div>
                                    <h2 className="text-lg font-bold mb-2">{c.title}</h2>
                                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                                        {c.description}
                                    </p>

                                    {/* 🔹 Progress Bar */}
                                    <div className="mb-3">
                                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                                            <span>{c.progress.toFixed(1)}%</span>
                                            <span>
                                                {c.amountRaised} ETH / {c.goal} ETH
                                            </span>
                                        </div>
                                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-3 rounded-full transition-all duration-300 ${
                                                    c.isGoalReached
                                                        ? 'bg-green-500'
                                                        : c.isCampaignEnded
                                                        ? 'bg-red-500'
                                                        : 'bg-blue-500'
                                                }`}
                                                style={{ width: `${c.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <p
                                        className={`mt-2 text-sm font-medium ${
                                            c.status === '💰 Fonds retirés'
                                                ? 'text-purple-600'
                                                : c.status.includes('✅')
                                                ? 'text-green-600'
                                                : c.status.includes('❌')
                                                ? 'text-red-500'
                                                : 'text-blue-600'
                                        }`}
                                    >
                                        {c.status}
                                    </p>
                                </div>

                                {/* 🔹 Bouton de retrait */}
                                {c.canWithdraw && (
                                    <button
                                        onClick={() => withdrawFunds(c.campaignId)}
                                        disabled={withdrawing[c.campaignId]}
                                        className="w-full mt-4 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {withdrawing[c.campaignId]
                                            ? '⏳ Retrait en cours...'
                                            : '💰 Retirer les fonds'}
                                    </button>
                                )}

                                {/* 🔹 Message si fonds déjà retirés */}
                                {c.fundsWithdrawn && (
                                    <div className="w-full mt-4 bg-gray-100 text-gray-600 py-2 rounded-lg text-center font-medium">
                                        ✅ Fonds déjà retirés
                                    </div>
                                )}

                                {/* 🔹 Message si pas encore éligible au retrait */}
                                {!c.isCampaignEnded && !c.fundsWithdrawn && (
                                    <div className="w-full mt-4 bg-blue-50 text-blue-600 py-2 rounded-lg text-center text-sm">
                                        ⏳ Campagne en cours
                                    </div>
                                )}

                                {c.isCampaignEnded && !c.isGoalReached && !c.fundsWithdrawn && (
                                    <div className="w-full mt-4 bg-red-50 text-red-600 py-2 rounded-lg text-center text-sm">
                                        ❌ Objectif non atteint
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
