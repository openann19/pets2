import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';
export const PostCreation = ({ value, onChange, onSubmit, isSubmitting, placeholder = "Share something with your community...", }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (value.trim() && !isSubmitting) {
            onSubmit();
        }
    };
    return (<Card id="community-post-creation" role="region" aria-labelledby="post-creation-heading">
      <CardHeader>
        <CardTitle id="post-creation-heading">Share with Your Community</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="flex items-start gap-3">
          <Avatar>
            <AvatarFallback aria-label="Your profile avatar">You</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="min-h-[80px] resize-none" aria-label="Write your community post" disabled={isSubmitting}/>
            <div className="flex justify-end mt-3">
              <Button type="submit" disabled={!value.trim() || isSubmitting} aria-label={isSubmitting ? "Creating post..." : "Create community post"}>
                {isSubmitting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>);
};
//# sourceMappingURL=PostCreation.jsx.map
//# sourceMappingURL=PostCreation.jsx.map