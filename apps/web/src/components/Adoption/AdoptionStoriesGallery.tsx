import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardComponent as Card, CardContentComponent as CardContent } from '@/components/ui/card';
import { CarouselComponent as Carousel, CarouselContentComponent as CarouselContent, CarouselItemComponent as CarouselItem, CarouselNextComponent as CarouselNext, CarouselPreviousComponent as CarouselPrevious, } from '@/components/ui/carousel';
import { DialogComponent as Dialog, DialogContentComponent as DialogContent, DialogDescriptionComponent as DialogDescription, DialogHeaderComponent as DialogHeader, DialogTitleComponent as DialogTitle, } from '@/components/ui/dialog';
import { Calendar, Heart, Quote, Share2, Star } from 'lucide-react';
import { useState } from 'react';
export const AdoptionStoriesGallery = ({ stories, onLoadMore, hasMore = false, isLoading = false, }) => {
    const [selectedStory, setSelectedStory] = useState(null);
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
    const StoryCard = ({ story, onClick }) => (<Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={onClick}>
      <div className="relative">
        <img src={story.photos[0] || '/placeholder-pet.jpg'} alt={`${story.petId} adoption story`} className="w-full h-48 object-cover rounded-t-lg"/>
        {story.featured && (<Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
            <Star className="h-3 w-3 mr-1"/>
            Featured
          </Badge>)}
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1">{story.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{story.story}</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3"/>
              {formatDate(story.adoptionDate)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3"/>
              Success Story
            </span>
          </div>
        </div>
      </CardContent>
    </Card>);
    const StoryModal = ({ story, onClose }) => {
        const [activeTab, setActiveTab] = useState('story');
        return (<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500"/>
            {story.title}
            {story.featured && (<Badge variant="secondary">
                <Star className="h-3 w-3 mr-1"/>
                Featured
              </Badge>)}
          </DialogTitle>
          <DialogDescription>
            Adoption completed on {formatDate(story.adoptionDate)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Photo Carousel */}
          {story.photos.length > 0 && (<div className="relative">
              <Carousel className="w-full">
                <CarouselContent>
                  {story.photos.map((photo, index) => (<CarouselItem key={index}>
                      <div className="relative aspect-video">
                        <img src={photo} alt={`Adoption story photo ${index + 1}`} className="w-full h-full object-cover rounded-lg"/>
                      </div>
                    </CarouselItem>))}
                </CarouselContent>
                {story.photos.length > 1 && (<>
                    <CarouselPrevious />
                    <CarouselNext />
                  </>)}
              </Carousel>
            </div>)}

          {/* Tabs */}
          <div className="flex border-b">
            <button onClick={() => setActiveTab('story')} className={`px-4 py-2 font-medium ${activeTab === 'story'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'}`}>
              Adoption Story
            </button>
            {story.followUpUpdates && story.followUpUpdates.length > 0 && (<button onClick={() => setActiveTab('updates')} className={`px-4 py-2 font-medium ${activeTab === 'updates'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'}`}>
                Follow-up Updates ({story.followUpUpdates.length})
              </button>)}
          </div>

          {/* Content */}
          <div className="min-h-[200px]">
            {activeTab === 'story' ? (<div className="space-y-4">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{story.story}</p>
                </div>

                {story.testimonial && (<div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-start gap-3">
                      <Quote className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0"/>
                      <div>
                        <p className="italic text-gray-700">"{story.testimonial}"</p>
                        <p className="text-sm text-gray-600 mt-2">- Happy Adopter</p>
                      </div>
                    </div>
                  </div>)}
              </div>) : (<div className="space-y-4">
                {story.followUpUpdates?.map((update, index) => (<Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4"/>
                          {formatDate(update.date)}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{update.update}</p>
                      {update.photos && update.photos.length > 0 && (<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {update.photos.map((photo, photoIndex) => (<img key={photoIndex} src={photo} alt={`Follow-up photo ${photoIndex + 1}`} className="w-full h-20 object-cover rounded"/>))}
                        </div>)}
                    </CardContent>
                  </Card>)) || (<p className="text-gray-500 text-center py-8">
                      No follow-up updates available yet.
                    </p>)}
              </div>)}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2"/>
              Share Story
            </Button>
          </div>
        </div>
      </DialogContent>);
    };
    return (<div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Adoption Success Stories</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Real stories of pets finding their forever homes. These heartwarming tales show the joy
          that comes from successful adoptions.
        </p>
      </div>

      {/* Featured Stories */}
      {stories.filter((story) => story.featured).length > 0 && (<div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500"/>
            Featured Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories
                .filter((story) => story.featured)
                .map((story) => (<StoryCard key={story._id} story={story} onClick={() => setSelectedStory(story)}/>))}
          </div>
        </div>)}

      {/* All Stories */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">All Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (<StoryCard key={story._id} story={story} onClick={() => setSelectedStory(story)}/>))}
        </div>
      </div>

      {/* Load More */}
      {hasMore && (<div className="text-center">
          <Button onClick={onLoadMore} disabled={isLoading} variant="outline" size="lg">
            {isLoading ? 'Loading...' : 'Load More Stories'}
          </Button>
        </div>)}

      {/* Statistics */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Our Impact</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stories.length}</div>
                <div className="text-sm text-gray-600">Success Stories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stories.filter((s) => s.followUpUpdates && s.followUpUpdates.length > 0).length}
                </div>
                <div className="text-sm text-gray-600">With Updates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stories.filter((s) => s.featured).length}
                </div>
                <div className="text-sm text-gray-600">Featured</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stories.reduce((acc, story) => acc + (story.followUpUpdates?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Follow-ups</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {selectedStory && (<Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
          <StoryModal story={selectedStory} onClose={() => setSelectedStory(null)}/>
        </Dialog>)}
    </div>);
};
//# sourceMappingURL=AdoptionStoriesGallery.jsx.map
//# sourceMappingURL=AdoptionStoriesGallery.jsx.map