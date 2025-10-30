/**
 * Pet Share View Component
 * Displays pet profile for social sharing
 */
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShareIcon, HeartIcon, MapPinIcon, CalendarIcon, UserIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { InteractiveButton } from '@/components/ui/Interactive';
import { useSocialShare } from '@/hooks/useSocialShare';
export function PetShareView({ pet }) {
    const { shareToSocial, isSharing } = useSocialShare();
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const shareUrl = `${window.location.origin}/share/${pet.id}`;
    const shareText = `Meet ${pet.name}, a ${pet.age}-year-old ${pet.breed} looking for friends on PawfectMatch! 🐾`;
    const handleShare = async (platform) => {
        await shareToSocial(platform, {
            url: shareUrl,
            text: shareText,
            title: `${pet.name} - ${pet.breed} | PawfectMatch`
        });
    };
    const nextPhoto = () => {
        if (pet.photos && pet.photos.length > 1) {
            setCurrentPhotoIndex((prev) => (prev + 1) % pet.photos.length);
        }
    };
    const prevPhoto = () => {
        if (pet.photos && pet.photos.length > 1) {
            setCurrentPhotoIndex((prev) => (prev - 1 + pet.photos.length) % pet.photos.length);
        }
    };
    return (<div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
            <SparklesIcon className="w-6 h-6 text-pink-500"/>
            <span className="text-lg font-semibold text-gray-900">
              PawfectMatch
            </span>
          </motion.div>
        </div>

        {/* Main Card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Pet Photo */}
          <div className="relative h-96 bg-gradient-to-br from-pink-100 to-purple-100">
            {pet.photos && pet.photos.length > 0 ? (<>
                <img src={pet.photos[currentPhotoIndex]} alt={pet.name} className="w-full h-full object-cover"/>
                
                {/* Photo Navigation */}
                {pet.photos.length > 1 && (<>
                    <button onClick={prevPhoto} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors">
                      <ArrowRightIcon className="w-5 h-5 text-gray-700 rotate-180"/>
                    </button>
                    <button onClick={nextPhoto} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors">
                      <ArrowRightIcon className="w-5 h-5 text-gray-700"/>
                    </button>
                    
                    {/* Photo Indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {pet.photos.map((_, index) => (<button key={index} onClick={() => { setCurrentPhotoIndex(index); }} className={`w-2 h-2 rounded-full transition-colors ${index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'}`}/>))}
                    </div>
                  </>)}
              </>) : (<div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <HeartIcon className="w-16 h-16 text-pink-300 mx-auto mb-4"/>
                  <p className="text-gray-500">No photos available</p>
                </div>
              </div>)}

            {/* Premium Badge */}
            <div className="absolute top-4 right-4">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Premium
              </div>
            </div>
          </div>

          {/* Pet Info */}
          <div className="p-8">
            {/* Name and Basic Info */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {pet.name}
              </h1>
              <div className="flex items-center justify-center space-x-4 text-gray-600">
                <span className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1"/>
                  {pet.age} years old
                </span>
                <span className="flex items-center">
                  <UserIcon className="w-4 h-4 mr-1"/>
                  {pet.gender === 'male' ? '♂' : pet.gender === 'female' ? '♀' : '?'}
                </span>
                <span className="capitalize">{pet.size}</span>
              </div>
              <p className="text-xl text-gray-700 mt-2">
                {pet.breed}
              </p>
            </div>

            {/* Bio */}
            {pet.bio && (<div className="mb-6">
                <p className="text-gray-700 text-center leading-relaxed">
                  "{pet.bio}"
                </p>
              </div>)}

            {/* Location */}
            {pet.location && (<div className="flex items-center justify-center mb-6">
                <MapPinIcon className="w-5 h-5 text-gray-400 mr-2"/>
                <span className="text-gray-600">{pet.location}</span>
              </div>)}

            {/* Owner Info */}
            {pet.owner && (<div className="flex items-center justify-center mb-6">
                <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2">
                  {pet.owner.avatar ? (<img src={pet.owner.avatar} alt={pet.owner.name} className="w-8 h-8 rounded-full object-cover"/>) : (<div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {pet.owner.name.charAt(0)}
                      </span>
                    </div>)}
                  <span className="text-gray-700 font-medium">
                    Owned by {pet.owner.name}
                  </span>
                </div>
              </div>)}

            {/* Call to Action */}
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-4">
                Want to find matches for your pet too?
              </p>
              <InteractiveButton onClick={() => window.open('/', '_blank')} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200" icon={<SparklesIcon className="w-5 h-5"/>}>
                Join PawfectMatch
              </InteractiveButton>
            </div>

            {/* Share Buttons */}
            <div className="border-t pt-6">
              <h3 className="text-center text-gray-700 font-medium mb-4">
                Share this profile
              </h3>
              <div className="flex justify-center space-x-4">
                <InteractiveButton onClick={() => handleShare('twitter')} disabled={isSharing} variant="outline" size="sm" className="text-blue-500 border-blue-500 hover:bg-blue-50" icon={<ShareIcon className="w-4 h-4"/>}>
                  Twitter
                </InteractiveButton>
                <InteractiveButton onClick={() => handleShare('facebook')} disabled={isSharing} variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50" icon={<ShareIcon className="w-4 h-4"/>}>
                  Facebook
                </InteractiveButton>
                <InteractiveButton onClick={() => handleShare('copy')} disabled={isSharing} variant="outline" size="sm" className="text-gray-600 border-gray-600 hover:bg-gray-50" icon={<ShareIcon className="w-4 h-4"/>}>
                  Copy Link
                </InteractiveButton>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Powered by PawfectMatch - Where pets find their perfect matches
          </p>
        </motion.div>
      </div>
    </div>);
}
//# sourceMappingURL=PetShareView.jsx.map