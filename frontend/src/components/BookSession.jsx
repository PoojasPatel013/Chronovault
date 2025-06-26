"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Phone, Video, MapPin } from "lucide-react"

const BookSession = () => {
  const [therapists, setTherapists] = useState([])
  const [selectedTherapist, setSelectedTherapist] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [sessionType, setSessionType] = useState("in-person")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [credits, setCredits] = useState(0)
  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })
          },
          (error) => {
            console.error("Error getting user location:", error)
          },
        )
      }

      try {
        // Simulate therapist data with location
        const mockTherapists = [
          {
            id: "1",
            name: "Dr. Sarah Johnson",
            specialization: "Anxiety & Depression",
            location: { lat: 40.7128, lng: -74.006 },
            availability: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"],
            price: 50,
            phone: "+1 (555) 123-4567",
            email: "sarah.johnson@therapy.com",
            address: "123 Main St, New York, NY 10001",
          },
          {
            id: "2",
            name: "Dr. Michael Chen",
            specialization: "Trauma & PTSD",
            location: { lat: 40.7589, lng: -73.9851 },
            availability: ["10:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"],
            price: 60,
            phone: "+1 (555) 987-6543",
            email: "michael.chen@therapy.com",
            address: "456 Park Ave, New York, NY 10016",
          },
        ]
        setTherapists(mockTherapists)

        // Simulate user credits
        setCredits(150)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load therapists or user data.")
      }
    }

    fetchData()
  }, [])

  const handleBooking = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/therapists/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          therapistId: selectedTherapist,
          date: selectedDate,
          time: selectedTime,
          sessionType,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess(true)
        setCredits(credits - (therapists.find((t) => t.id === selectedTherapist)?.price || 0))
      } else {
        throw new Error("Booking failed")
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-8 text-center"
        >
          Book a Therapy Session
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Therapist List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold mb-4">Available Therapists Near You</h2>
            {therapists.map((therapist) => (
              <div
                key={therapist.id}
                className={`bg-gray-800 p-4 rounded-lg cursor-pointer transition-all ${
                  selectedTherapist === therapist.id ? "ring-2 ring-indigo-500" : "hover:bg-gray-700"
                }`}
                onClick={() => setSelectedTherapist(therapist.id)}
              >
                <h3 className="text-lg font-semibold">{therapist.name}</h3>
                <p className="text-gray-400">{therapist.specialization}</p>
                <div className="flex items-center mt-2 text-sm text-gray-300">
                  <MapPin size={16} className="mr-1" />
                  <span>{therapist.address}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-green-400">{therapist.price} credits</span>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone size={16} />
                    <Video size={16} />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 p-6 rounded-lg shadow-md"
          >
            <h2 className="text-2xl font-semibold mb-4">Book Your Session</h2>
            <form onSubmit={handleBooking} className="space-y-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-300">
                  Select Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-300">
                  Select Time
                </label>
                <select
                  id="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                  required
                >
                  <option value="">Choose a time</option>
                  {selectedTherapist &&
                    therapists
                      .find((t) => t.id === selectedTherapist)
                      ?.availability.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Session Type</label>
                <div className="mt-2 flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-indigo-600"
                      name="sessionType"
                      value="in-person"
                      checked={sessionType === "in-person"}
                      onChange={() => setSessionType("in-person")}
                    />
                    <span className="ml-2">In-person</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-indigo-600"
                      name="sessionType"
                      value="video"
                      checked={sessionType === "video"}
                      onChange={() => setSessionType("video")}
                    />
                    <span className="ml-2">Video Call</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Your Credits: {credits}</span>
                <span className="text-sm text-gray-300">
                  Session Cost: {selectedTherapist && therapists.find((t) => t.id === selectedTherapist)?.price} credits
                </span>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading || !selectedTherapist}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? "Booking..." : "Book Session"}
                </button>
              </div>
            </form>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-center text-sm text-red-600"
              >
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-center text-sm text-green-600"
              >
                Session booked successfully! Your new credit balance: {credits}
              </motion.p>
            )}
          </motion.div>
        </div>

        {/* Therapist Details */}
        {selectedTherapist && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 bg-gray-800 p-6 rounded-lg shadow-md"
          >
            <h2 className="text-2xl font-semibold mb-4">Therapist Details</h2>
            {(() => {
              const therapist = therapists.find((t) => t.id === selectedTherapist)
              return therapist ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="mb-2">
                      <strong>Name:</strong> {therapist.name}
                    </p>
                    <p className="mb-2">
                      <strong>Specialization:</strong> {therapist.specialization}
                    </p>
                    <p className="mb-2">
                      <strong>Address:</strong> {therapist.address}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2">
                      <strong>Contact:</strong>
                    </p>
                    <p className="ml-4 mb-1 flex items-center">
                      <Phone className="inline-block mr-2" size={16} /> {therapist.phone}
                    </p>
                    <p className="ml-4 flex items-center">
                      <Video className="inline-block mr-2" size={16} /> {therapist.email}
                    </p>
                  </div>
                </div>
              ) : null
            })()}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default BookSession
