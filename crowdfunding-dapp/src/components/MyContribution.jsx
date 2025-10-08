import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import CrowdFundingABI from '../CrowdFundingABI.json'
import { useNavigate } from 'react-router-dom'

const CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'

export default function MyContributions() {
    const [account, setAccount] = useState(null)
    const [contributions, setContributions] = useState([])
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const connectWallet = async () => {
            if (!window.ethereum) return alert('Installe MetaMask !')
            const provider = new ethers.BrowserProvider(window.ethereum)
            const accounts = await provider.send('eth_requestAccounts', [])
            setAccount(accounts[0])
        }
        connectWallet()
    }, [])

    useEffect(() => {
        if (!account) return

        const fetchContributions = async () => {
            try {
                setLoading(true)
                const provider = new ethers.BrowserProvider(window.ethereum)
                const signer = await provider.getSigner()
                const contract = new ethers.Contract(CONTRACT_ADDRESS, CrowdFundingABI, signer)

                // IDs des campagnes auxquelles l'utilisateur a contribué
                const campaignIds = await contract.getMyContributions()

                const detailed = await Promise.all(
                    campaignIds.map(async id => {
                        const [title, , image, , goal, deadline, amountRaised] = await contract.getCampaignInfo(id)
                        const amount = await contract.contributions(id, account)

                        const now = Math.floor(Date.now() / 1000)
                        const deadlineNumber = Number(deadline)
                        const daysLeft = deadlineNumber > now ? Math.ceil((deadlineNumber - now) / (60 * 60 * 24)) : 0
                        const isCampaignEnded = deadlineNumber <= now
                        const status = isCampaignEnded ? 'Déjà terminé' : `${daysLeft} jours restants`

                        // Calcul de la progression
                        const progress = (parseFloat(ethers.formatEther(amountRaised)) / parseFloat(ethers.formatEther(goal))) * 100

                        return {
                            campaignId: id.toString(),
                            title,
                            image,
                            amount: ethers.formatEther(amount),
                            status,
                            isCampaignEnded,
                            goal: ethers.formatEther(goal),
                            amountRaised: ethers.formatEther(amountRaised),
                            progress: Math.min(progress, 100)
                        }
                    })
                )

                setContributions(detailed)
            } catch (err) {
                console.error('Erreur fetch contributions:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchContributions()
    }, [account])

    if (!account) return <p className="p-6">Connectez MetaMask pour voir vos contributions</p>
    if (loading) return <p className="p-6">Chargement des contributions...</p>
    if (contributions.length === 0) return <p className="p-6">Aucune contribution trouvée.</p>

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
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes Contributions</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                {contributions.map(c => (
                    <div
                        key={c.campaignId}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden w-96 h-[450px] flex flex-col"
                    >
                        <div className="h-48 w-full overflow-hidden">
                            <img
                                src={c.image || 'https://via.placeholder.com/400x300'}
                                alt={c.title}
                                className="w-full h-48 object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/400x300'
                                }}
                            />
                        </div>
                        <div className="p-4 flex flex-col flex-grow justify-between">
                            <div>
                                <h2 className="font-bold text-lg mb-2">{c.title}</h2>
                                <p className="text-gray-600 mb-3">
                                    Votre contribution:{' '}
                                    <span className="font-semibold text-green-600">{c.amount} ETH</span>
                                </p>

                                {/* 🔹 Range/Progress Bar */}
                                <div className="mb-3">
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>{c.progress.toFixed(1)}%</span>
                                        <span>{c.amountRaised} ETH / {c.goal} ETH</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-3 rounded-full transition-all duration-300 ${
                                                c.isCampaignEnded ? 'bg-red-500' : 'bg-blue-500'
                                            }`}
                                            style={{ width: `${c.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <p
                                    className={`font-medium ${
                                        c.status === 'Déjà terminé' ? 'text-red-500' : 'text-green-500'
                                    }`}
                                >
                                    {c.status}
                                </p>
                            </div>

                            {/* Boutons Détails et Contribuer */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate(`/campaign/${c.campaignId}`)}
                                    className="flex-1 border-2 border-blue-500 text-blue-500 py-2 rounded-lg font-semibold hover:bg-blue-500 hover:text-white transition text-sm"
                                >
                                    Détails
                                </button>
                                {!c.isCampaignEnded ? (
                                    <button
                                        onClick={() => navigate(`/campaign/${c.campaignId}/contribute`)}
                                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition text-sm"
                                    >
                                        Contribuer
                                    </button>
                                ) : (
                                    <button
                                        className="flex-1 bg-gray-400 text-white py-2 rounded-lg font-semibold cursor-not-allowed text-sm"
                                        disabled
                                    >
                                        Terminé
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
