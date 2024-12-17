# CS546_TeamProject
Final project code for CS 546, Stevens Institute of Technology

GitHub Repository: [link](https://github.com/rohhn/Personal-Mentoring-App.git)

## Personal Mentoring Web App

### Proposed features 

- ⁠User sign up/ login
- ⁠User management
- Features for Mentors
- Functionalities for Mentees
- Ratings and Review Mechanism
- Subject Specific Forums
- Digital Acheivement Badges

## Run Instructions

The database is hosted on MongoDB Atlas, it's pre-seeded.

All required environment secrets for third-party integrations are provided in the `.env` file.

To run:

- Install all required packages
```bash
npm i
```

- Run the app using
```
npm start
```

## Development

### GitHub

- `main` is a protected branch. No pushes are allowed on this branch.
- `dev` will be our main development branch. All merges from `feature` branches should merge to `dev` before going to `main`.
- To make changes:
    - Clone the repository using `git clone`
    - Switch to the dev branch using `git checkout dev`
    - Pull all latest changes in the `dev` branch using `git pull`
    - Create your own feature branch from the `dev` branch using `git checkout -b feature/{feature_name}`
    - Push all your changes to your `feature` branch and create a pull request to the `dev` branch.


### Front-end setup

- Setup the required environment variables.
  - Create a copy of the `env_template` file and rename it to `.env`
  
  ```shell
  cp env_template .env
  ```

  - Populate all values in the `.env` file.

You can use this [website](https://djecrety.ir/) to generate an express session secret token.