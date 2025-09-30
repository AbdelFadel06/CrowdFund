import { useState } from 'react'
import { useCrowdFunding } from '../hooks/useCrowdFunding'

export default function CreateCampaign() {
    const { createCampaign } = useCrowdFunding()
    const [goal, setGoal] = useState('')
    const [deadline, setDeadline] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [image, setImage] = useState('')
    const [uploading, setUploading] = useState(false)

    // 🔹 Upload image vers Cloudinary
    const handleImageUpload = async e => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', 'crowdfunding_upload') // preset Cloudinary
        formData.append('cloud_name', 'dbbw74aip') // ton cloud name

        setUploading(true)

        try {
            const res = await fetch('https://api.cloudinary.com/v1_1/dbbw74aip/image/upload', {
                method: 'POST',
                body: formData,
            })

            const data = await res.json()
            setImage(data.secure_url)
        } catch (err) {
            console.error('Erreur upload image:', err)
            alert('Échec de l’upload de l’image')
        } finally {
            setUploading(false)
        }
    }

    const convertDeadlineToTimestamp = date => {
        if (!date) return 0

        const dateObj = new Date(date)
        dateObj.setHours(23, 59, 59, 0) // 23:59:59 du jour sélectionné
        return Math.floor(dateObj.getTime() / 1000)
    }

    // 🔹 Soumission du formulaire
    const handleSubmit = async e => {
        e.preventDefault()
        try {
            const deadlineTimestamp = convertDeadlineToTimestamp(deadline)

            const txHash = await createCampaign(
                goal,
                deadlineTimestamp,
                title,
                description,
                image // on passe aussi l’URL de l’image
            )

            alert(`✅ Campagne créée ! TX Hash: ${txHash}`)

            // Reset du form
            setGoal('')
            setDeadline('')
            setTitle('')
            setDescription('')
            setImage('')
        } catch (err) {
            console.error(err)
            alert('❌ Erreur lors de la création de la campagne')
        }
    }

    return (
        <div className="flex justify-center mt-8 ">
            <div className="w-full max-w-lg p-6 border rounded-2xl shadow-xl bg-white">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    🎯 Créer une campagne
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Champ Titre */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Titre</legend>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
                            placeholder="Donnez un titre à votre campagne..."
                            required
                        />
                    </fieldset>

                    {/* Champ Description */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Description</legend>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full p-3 border rounded-lg h-24 focus:ring focus:ring-blue-300"
                            placeholder="Décrivez votre campagne..."
                            required
                        ></textarea>
                    </fieldset>

                    {/* Champ Objectif */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Objectif (en WEI)</legend>
                        <input
                            type="number"
                            value={goal}
                            onChange={e => setGoal(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
                            placeholder="Ex: 1000000000000000000 (1 ETH)"
                            required
                        />
                    </fieldset>

                    {/* Champ Deadline */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Deadline</legend>
                        <input
                            type="date"
                            value={deadline}
                            onChange={e => setDeadline(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
                            required
                        />
                    </fieldset>

                    {/* Champ Image */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Image</legend>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full p-2"
                        />
                        {uploading && <p className="text-sm text-gray-500">⏳ Uploading...</p>}
                        {image && (
                            <img
                                src={image}
                                alt="Preview"
                                className="mt-3 w-full h-40 object-cover rounded-lg"
                            />
                        )}
                    </fieldset>

                    {/* Bouton Créer */}
                    <button
                        type="submit"
                        disabled={uploading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                        🚀 Créer
                    </button>
                </form>
            </div>
        </div>
    )
}
