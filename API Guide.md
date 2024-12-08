# API Guide

## Mentors API

Route: `/mentor/`

Method: `GET`

Description: Get a list of all mentors

Request Payload:
```json
```

Expected Response:
```
[
    {'_id': 'mentor_id',
    'name': 'firstname lastname'},
    {'_id': 'mentor_id',
    'name': 'firstname lastname'}
]
```

Route: `/mentor/`

Method: `POST`

Description: Enter Mentor data in Collection

Request Payload:
```
```

Expected Response:
```
{
     "_id": "12345",
    "first_name": "Test",
    "last_name": "Test",
    "email": "test@test11.com",
    "dob": "02/15/2000",
    "created_at": "02/12/2024",
    "profile_image": "https://url.png",
    "approved": true,
    "summary": "leading tech team at Google. Expert in Data Science.",
    "education": [
        {
            "degree": "PhD in XYZ",
            "institution": "Stevens Institute of Technology",
            "year": 2018
        }
    ],
    "experience": [
        {
            "title": "Director of Technology",
            "institution": "Google",
            "years": 2
        }
    ],
    "reviews": [
        {
            "session_id": "session_id_ref",
            "rating": 5,
            "feedback": "this is a review",
            "author": "Mentee ID",
            "created_at": "2024-11-05T14:00:00Z"
        }
    ],
    "badges": [
        {
            "badge_id": "badge_ref",
            "created_at": "2024-11-05T14:00:00Z"
        }
    ],
    "subject_areas": [
        "subject_area_ref"
    ],
    "availability": [
       {
            "day": "Monday",
            "start_time": "14:00",
            "end_time": "16:00",
            "booked_slots": [
            "2024-11-13T14:30:00Z",
            "2024-11-13T15:00:00Z"
        ]  
        },
        {
            "day": "Tuesday",
            "start_time": "10:00",
            "end_time": "12:00",
            "booked_slots": []
        }
    ]
}
```

Route: `/mentor/:mentorId`

Method: `GET`

Description: Gets a mentor by id

Request Payload:
```json
```

Expected Response:
```
{
     "_id": "12345",
    "first_name": "Test",
    "last_name": "Test",
    "email": "test@test11.com",
    "dob": "02/15/2000",
    "created_at": "02/12/2024",
    "profile_image": "https://url.png",
    "approved": true,
    "summary": "leading tech team at Google. Expert in Data Science.",
    "education": [
        {
            "degree": "PhD in XYZ",
            "institution": "Stevens Institute of Technology",
            "year": 2018
        }
    ],
    "experience": [
        {
            "title": "Director of Technology",
            "institution": "Google",
            "years": 2
        }
    ],
    "reviews": [
        {
            "session_id": "session_id_ref",
            "rating": 5,
            "feedback": "this is a review",
            "author": "Mentee ID",
            "created_at": "2024-11-05T14:00:00Z"
        }
    ],
    "badges": [
        {
            "badge_id": "badge_ref",
            "created_at": "2024-11-05T14:00:00Z"
        }
    ],
    "subject_areas": [
        "subject_area_ref"
    ],
    "availability": [
       {
            "day": "Monday",
            "start_time": "14:00",
            "end_time": "16:00",
            "booked_slots": [
            "2024-11-13T14:30:00Z",
            "2024-11-13T15:00:00Z"
        ]  
        },
        {
            "day": "Tuesday",
            "start_time": "10:00",
            "end_time": "12:00",
            "booked_slots": []
        }
    ]
}
```

Route: `/mentor/:mentorId`

Method: `DELETE`

Description: Deletes Mentor by id

Request Payload:
```
```

Expected Response:
```
{
    "_id": "mentor_id",
    "deleted": "true"
}
```

Route: `/mentor/:mentorId`

Method: `PUT`

Description: Updating the Mentor

Request Payload:
```
The Payload and response for this has to change
```

Expected Response:
```
{
     "_id": "12345",
    "first_name": "Test",
    "last_name": "Test",
    "email": "test@test11.com",
    "dob": "02/15/2000",
    "created_at": "02/12/2024",
    "profile_image": "https://url.png",
    "approved": true,
    "summary": "leading tech team at Google. Expert in Data Science.",
    "education": [
        {
            "degree": "PhD in XYZ",
            "institution": "Stevens Institute of Technology",
            "year": 2018
        }
    ],
    "experience": [
        {
            "title": "Director of Technology",
            "institution": "Google",
            "years": 2
        }
    ],
    "reviews": [
        {
            "session_id": "session_id_ref",
            "rating": 5,
            "feedback": "this is a review",
            "author": "Mentee ID",
            "created_at": "2024-11-05T14:00:00Z"
        }
    ],
    "badges": [
        {
            "badge_id": "badge_ref",
            "created_at": "2024-11-05T14:00:00Z"
        }
    ],
    "subject_areas": [
        "subject_area_ref"
    ],
    "availability": [
       {
            "day": "Monday",
            "start_time": "14:00",
            "end_time": "16:00",
            "booked_slots": [
            "2024-11-13T14:30:00Z",
            "2024-11-13T15:00:00Z"
        ]  
        },
        {
            "day": "Tuesday",
            "start_time": "10:00",
            "end_time": "12:00",
            "booked_slots": []
        }
    ]
}
```

Route: `/mentor/availability/:mentorId`

Method: `POST`

Description: Adds Availability to mentor

Request Payload:
```json
{
    "av": [
        {
            "day": "Monday",
            "start_time": "14:00",
            "end_time": "16:00",
            "booked_slots": [
                "2024-11-13T14:30:00Z",
                "2024-11-13T15:00:00Z"
            ]  
        },
        {
            "day": "Tuesday",
            "start_time": "10:00",
            "end_time": "12:00",
            "booked_slots": []
        }
    ]
}
```

Expected Response:
```
No Response right Now, Have to make this change and the option to get availability too
```

Route: `/mentor/:mentorId/edit`

Method: `POST`

Description: To edit mentor profile

Request Payload:
```
```

Expected Response:
```
```

## Mentees API

Route: `/mentee/`

Method: `GET`

Description: Get a list of all mentees

Request Payload:
```json
```

Expected Response:
```
[
    {'_id': 'mentee_id',
    'name': 'firstname lastname'},
    {'_id': 'mentee_id',
    'name': 'firstname lastname'}
]
```

Route: `/mentee/`

Method: `POST`

Description: Enter mentee in the collection

Request Payload:
```json
```

Expected Response:
```
{
    "_id": "12345",
    "first_name": "Test",
    "last_name": "Test",
    "email": "test@test.com",
    "dob": "1998-11-05",
    "pwd_hash": "pwd",
    "created_at": "2024-11-05T14:00:00Z",
    "parent_email": "test_parent@test.com | null",
    "profile_image": "https://url.png",
    "summary": "MSCS in student at Stevens institute of technology, interested in XYZ",
    "skills": [
        "skill 1"
    ],
    "reviews": [
        {
            "session_id": "session_id_ref",
            "rating": 5,
            "feedback": "this is a review",
            "author": "Mentor ID",
            "created_at": "2024-11-05T14:00:00Z"
        }
    ],
    "badges": [
        {
            "badge_id": "badge_ref",
            "created_at": "2024-11-05T14:00:00Z"
        }
    ]
}
```

Route: `/mentee/:menteeId`

Method: `PUT`

Description: Enter mentee in the collection

Request Payload:
```json
```

Expected Response:
```
{ success: true }
```


Route: `/mentee/:menteeId`

Method: `DELETE`

Description: Enter mentee in the collection

Request Payload:
```json
```

Expected Response:
```
{ _id: menteeId, deleted: "true" }
```


Route: `/mentee/:menteeId/edit`

Method: `GET`

Description: Enter mentee in the collection

Request Payload:
```

```

Expected Response:
```

```

## Sessions API

Route: `/sessioms/`

Method: `POST`

Description: Get a list of all mentees

Request Payload:
```{
    "mentor_id": "mentor_id",
    "mentee_id": "mentor_id",
    "subject_area": "674cb8767e290b0de5ec2978",
    "start_time": "2024-12-01T17:00:00Z",
    "end_time": "2024-12-01T17:30:00Z"
}
```

Expected Response:
```
{
    "_id": "12345",
    "mentor_id": "mentor_id_ref",
    "mentee_id": "mentee_id_ref",
    "subject_area": "subject_area_ref",
    "start_time": "2024-12-01T17:00:00Z",
    "end_time": "2024-12-01T17:30:00Z",  
    "status": "scheduled | completed",
    "eventId":"calendar_event_id",
    "meeting_link": "meeting URL",
    "created_at": "2024-11-05T14:00:00Z"
}
```

Route: `/sessioms/mentee/:menteeId`

Method: `POST`

Description: Get a list of all sessions for a mentee - Will add the option for Making getting upcoming sessions, past sessions or all sessions

Request Payload:
```
```

Expected Response:
```
[
{
    "_id": "12345",
    "mentor_id": "mentor_id_ref",
    "mentee_id": "mentee_id_ref",
    "subject_area": "subject_area_ref",
    "start_time": "2024-12-01T17:00:00Z",
    "end_time": "2024-12-01T17:30:00Z",  
    "status": "scheduled | completed",
    "eventId":"calendar_event_id",
    "meeting_link": "meeting URL",
    "created_at": "2024-11-05T14:00:00Z"
}
]
```

Route: `/sessioms/mentor/:mentorId`

Method: `POST`

Description: Get a list of all sessions for a mentor - Will add the option for Making getting upcoming sessions, past sessions or all sessions

Request Payload:
```
```

Expected Response:
```
[
{
    "_id": "12345",
    "mentor_id": "mentor_id_ref",
    "mentee_id": "mentee_id_ref",
    "subject_area": "subject_area_ref",
    "start_time": "2024-12-01T17:00:00Z",
    "end_time": "2024-12-01T17:30:00Z",  
    "status": "scheduled | completed",
    "eventId":"calendar_event_id",
    "meeting_link": "meeting URL",
    "created_at": "2024-11-05T14:00:00Z"
}
]
```

Route: `/sessioms/:sessionId`

Method: `PUT`

Description: Reschedules the session

Request Payload:
```{
    "start_time": "2024-12-01T17:00:00Z",
    "end_time": "2024-12-01T17:30:00Z",
    "status": "status"
}
```

Expected Response:
```
{
    "_id": "12345",
    "mentor_id": "mentor_id_ref",
    "mentee_id": "mentee_id_ref",
    "subject_area": "subject_area_ref",
    "start_time": "2024-12-01T17:00:00Z",
    "end_time": "2024-12-01T17:30:00Z",  
    "status": "scheduled | completed",
    "eventId":"calendar_event_id",
    "meeting_link": "meeting URL",
    "created_at": "2024-11-05T14:00:00Z"
}
```

Route: `/sessioms/:sessionId`

Method: `DELETE`

Description: Cancels/Deletes the session - Right now the session is being deleted - I'll change it to update the status

Request Payload:
```{
    "start_time": "2024-12-01T17:00:00Z",
    "end_time": "2024-12-01T17:30:00Z",
    "status": "status"
}
```

Expected Response:
```
{
    "_id": "12345",
    "mentor_id": "mentor_id_ref",
    "mentee_id": "mentee_id_ref",
    "subject_area": "subject_area_ref",
    "start_time": "2024-12-01T17:00:00Z",
    "end_time": "2024-12-01T17:30:00Z",  
    "status": "scheduled | completed",
    "eventId":"calendar_event_id",
    "meeting_link": "meeting URL",
    "created_at": "2024-11-05T14:00:00Z"
}
```

## Subject Area API

Route: `/subjects/`

Method: `POST`

Description: Enter a new Subject

Request Payload:
```
{
    "name": "Data Science",
    "description": "New Description1
}
```

Expected Response:
```
{
    "_id": "12345"
    "name": "Data Science",
    "description": "New Description1
}
```

Route: `/subjects/`

Method: `GET`

Description: Get a List of Subjects

Request Payload:
```

```

Expected Response:
```
[{
    "_id": "12345"
    "name": "Data Science",
    "description": "New Description1
}]
```

Route: `/subjects/:subjectId`

Method: `GET`

Description: Get subject by id

Request Payload:
```

```

Expected Response:
```
{
    "_id": "12345"
    "name": "Data Science",
    "description": "New Description1
}
```

Route: `/subjects/:subjectId`

Method: `DELETE`

Description: Get subject by id

Request Payload:
```

```

Expected Response:
```
{ _id: subjectId, deleted: "true" }
```

Route: `/subjects/:subjectId`

Method: `PUT`

Description: Update Subject

Request Payload:
```
{
    "name": "Data Science",
    "description": "New Description1
}
```

Expected Response:
```
{
    "_id": "12345"
    "name": "Data Science",
    "description": "New Description1
}
```

##Posts API

Route: `/forum/:subject_id`

Method: GET

Description: Gets all posts and replies in a forum

Request Payload:
```

```

Expected Response:
```
    {
        "_id": "post_id",
        "author": "author_id",
        "title": "Post Title",
        "content": "Post content",
        "created_at": "Timestamp",
        "replies": []
    }
```

Route: `/forum/:subject_id`

Method: POST

Description: Create a new post.

Request Payload:
```
{
    "author": "author_id",
    "title": "Post Title",
    "content": "Post content"
}
```

Expected Response:
```
{
    "_id": "post_id",
    "author": "author_id",
    "title": "Post Title",
    "content": "Post content",
    "created_at": "Timestamp",
    "replies": []
}
```

Route: `/forum/:subject_id/:post_id`

Method: GET

Description: Fetch a specific post by its ID.

Request Payload: 
```

```

Expected Response:
```
{
    "_id": "post_id",
    "author": "author_id",
    "title": "Post Title",
    "content": "Post content",
    "created_at": "Timestamp",
    "replies": []
}
```

Method: PATCH

Description: Update a post

Request Payload:
```
{
    "title": "Updated Post Title",
    "content": "Updated Post Content"
}

    Expected Response:
```
{
    "_id": "post_id",
    "author": "author_id",
    "title": "Updated Post Title",
    "content": "Updated Post Content",
    "created_at": "Timestamp",
    "replies": []
}
```

Method: DELETE

Description: Delete a specific post.

Request Payload: 
```

```

Expected Response:
```
{ "_id": "post_id", "deleted": "true" }
```
```

##Replies API

Route: `/forum/:subject_id/:post_id/reply`

Method: POST

Description: Create a reply to a post

Request Payload:
```
{
    "author": "author_id",
    "content": "Reply content"
}
```

Expected Result:
```
{
    "_id": "reply_id",
    "author": "author_id",
    "content": "Reply content",
    "created_at": "Timestamp"
}
```

Route: `forum/subject_id/post_id/reply_id/edit`

Method: GET

Description: Gets a specific repsly by its ID

Request Payload:
```

```

Expected output:
```
{
    "_id": "reply_id",
    "author": "author_id",
    "content": "Reply content",
    "created_at": "Timestamp"
}
```

Method: PATCH

Description: Update a reply

Request Payload:
```
{
    "content": "Updated Reply Content"
}
```

Expected Output:
```
{
    "_id": "reply_id",
    "author": "author_id",
    "content": "Updated Reply Content",
    "created_at": "Timestamp"
}
```

Route: `forum/post_id/reply_id`

Method: DELETE

Description: Deletes a specific reply based on its ID

Request Payload:
```

```

Expected Output:
```
{ "_id": "reply_id", "deleted": "true" }
```