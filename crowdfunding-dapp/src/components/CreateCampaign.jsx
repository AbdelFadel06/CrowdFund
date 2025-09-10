import { useState } from 'react'
import { useCrowdFunding } from '../hooks/useCrowdFunding'

export default function CreateCampaign() {
    const { createCampaign } = useCrowdFunding()
    const [goal, setGoal] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [endDate, setEndDate] = useState('') // <- nouvelle valeur venant du calendar

    const handleSubmit = async e => {
        e.preventDefault()
        try {
            // conversion endDate -> secondes restantes
            const now = Math.floor(Date.now() / 1000) // en secondes
            const chosenDate = Math.floor(new Date(endDate).getTime() / 1000)
            const deadline = chosenDate - now

            if (deadline <= 0) {
                alert('Veuillez choisir une date ultérieure')
                return
            }

            const txHash = await createCampaign(goal, deadline, title, description)
            alert(`Campagne créée ! TX Hash: ${txHash}`)

            // reset
            setGoal('')
            setTitle('')
            setDescription('')
            setEndDate('')
        } catch (err) {
            console.error(err)
            alert('Erreur lors de la création de la campagne')
        }
    }

    return (
        <div className="p-6 border rounded-lg shadow-md bg-white">
            <h2 className="text-xl font-bold mb-4">Créer une campagne</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Titre</legend>
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        type="text"
                        className="input input-bordered"
                        placeholder="Donner un titre à votre campagne..."
                        required
                    />
                </fieldset>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Description</legend>
                    <textarea
                        className="textarea textarea-bordered h-24"
                        placeholder="Décrivez votre campagne..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                    />
                </fieldset>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Objectif en WEI</legend>
                    <input
                        value={goal}
                        onChange={e => setGoal(e.target.value)}
                        type="number"
                        className="input input-bordered"
                        placeholder="Définissez votre objectif..."
                        required
                    />
                </fieldset>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Date de fin</legend>
                    <input
                        type="datetime-local"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="input input-bordered"
                        required
                    />
                </fieldset>

                <button className="btn btn-primary">Créer</button>
            </form>
        </div>
    )
}
