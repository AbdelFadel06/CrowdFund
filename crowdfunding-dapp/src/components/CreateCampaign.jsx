import { useState } from 'react'
import { useCrowdFunding } from '../hooks/useCrowdFunding'
import { useNavigate } from 'react-router-dom'

export default function CreateCampaign() {
    const { createCampaign } = useCrowdFunding()
    const [goal, setGoal] = useState('')
    const [deadline, setDeadline] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [image, setImage] = useState('')
    const [uploading, setUploading] = useState(false)
    const [creating, setCreating] = useState(false)
    const navigate = useNavigate()

    // 🔹 Upload image vers Cloudinary
    const handleImageUpload = async e => {
        const file = e.target.files[0]
        if (!file) return

        // Vérification de la taille du fichier (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('❌ L\'image ne doit pas dépasser 5MB')
            return
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', 'crowdfunding_upload')
        formData.append('cloud_name', 'dbbw74aip')

        setUploading(true)

        try {
            const res = await fetch('https://api.cloudinary.com/v1_1/dbbw74aip/image/upload', {
                method: 'POST',
                body: formData,
            })

            const data = await res.json()
            if (data.secure_url) {
                setImage(data.secure_url)
                alert('✅ Image uploadée avec succès !')
            } else {
                throw new Error('Upload failed')
            }
        } catch (err) {
            console.error('Erreur upload image:', err)
            alert('❌ Échec de l\'upload de l\'image')
        } finally {
            setUploading(false)
        }
    }

    const convertDeadlineToTimestamp = date => {
        if (!date) return 0

        const dateObj = new Date(date)
        dateObj.setHours(23, 59, 59, 0)
        return Math.floor(dateObj.getTime() / 1000)
    }

    // 🔹 Soumission du formulaire
    const handleSubmit = async e => {
        e.preventDefault()

        // Validation
        if (!title || !description || !goal || !deadline) {
            alert('❌ Veuillez remplir tous les champs obligatoires')
            return
        }

        setCreating(true)

        try {
            const deadlineTimestamp = convertDeadlineToTimestamp(deadline)

            const txHash = await createCampaign(
                goal,
                deadlineTimestamp,
                title,
                description,
                image
            )

            alert(`✅ Campagne créée avec succès !\nTX Hash: ${txHash}`)

            // Redirection vers la page d'accueil
            setTimeout(() => {
                navigate('/')
            }, 2000)

        } catch (err) {
            console.error(err)
            alert('❌ Erreur lors de la création de la campagne')
        } finally {
            setCreating(false)
        }
    }

    // Date minimale (aujourd'hui)
    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0]
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Lancez Votre Campagne
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Créez une campagne de crowdfunding et commencez à collecter des fonds
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Colonne Image */}
                        <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-8 flex flex-col justify-center">
                            <div className="text-white text-center">
                                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="text-3xl">🎯</span>
                                </div>
                                <h2 className="text-2xl font-bold mb-4">
                                    Créer un Impact
                                </h2>
                                <p className="text-blue-100 mb-6 leading-relaxed">
                                    Partagez votre projet avec la communauté et récoltez les fonds nécessaires pour le concrétiser.
                                    Chaque campagne commence par une idée.
                                </p>
                                <div className="space-y-3 text-sm text-blue-100">
                                    <div className="flex items-center justify-center gap-2">
                                        <span>✅</span>
                                        <span>Setup en quelques minutes</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <span>✅</span>
                                        <span>Frais de plateforme réduits</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <span>✅</span>
                                        <span>Support 24/7</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Colonne Formulaire */}
                        <div className="p-8 lg:p-12">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                    Détails de la Campagne
                                </h2>
                                <p className="text-gray-600">
                                    Remplissez les informations de votre campagne
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Champ Titre */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Titre de la campagne *
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                                        placeholder="Donnez un titre accrocheur à votre campagne..."
                                        required
                                    />
                                </div>

                                {/* Champ Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 h-32 resize-none"
                                        placeholder="Décrivez votre projet en détail... Pourquoi est-il important ? Comment les fonds seront-ils utilisés ?"
                                        required
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Champ Objectif */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Objectif (ETH) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            value={goal}
                                            onChange={e => setGoal(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                                            placeholder="Ex: 1.5"
                                            min="0.001"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {goal ? `≈ ${(parseFloat(goal) * 1000000000000000000).toLocaleString()} WEI` : '1 ETH = 1 000 000 000 000 000 000 WEI'}
                                        </p>
                                    </div>

                                    {/* Champ Deadline */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Date de fin *
                                        </label>
                                        <input
                                            type="date"
                                            value={deadline}
                                            onChange={e => setDeadline(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                                            min={getTodayDate()}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Champ Image */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Image de la campagne
                                    </label>
                                    <div className="space-y-3">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        {uploading && (
                                            <div className="flex items-center gap-2 text-blue-600">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                <span className="text-sm">Upload en cours...</span>
                                            </div>
                                        )}
                                        {image && (
                                            <div className="mt-3">
                                                <p className="text-sm text-green-600 mb-2">✅ Image sélectionnée</p>
                                                <img
                                                    src={image}
                                                    alt="Preview"
                                                    className="w-full h-48 object-cover rounded-xl shadow-md"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bouton Créer */}
                                <button
                                    type="submit"
                                    disabled={uploading || creating}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    {creating ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Création en cours...</span>
                                        </div>
                                    ) : (
                                        '🚀 Lancer la campagne'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
