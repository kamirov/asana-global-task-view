# Development Notes

These notes were written for myself while developing. Might be using a lot of my own notation, shorthand, and half-written-thoughts here. This is by no means documentation, though if cleaned up could be.

## To Do

- [x] Decide on file structure
- [x] Write out process chain
- [x] Figure out the JSON API output
- [x] Figure out how to connect with Asana API
- [x] Finish build pipeline
- [x] Figure out unit tests
   - User info GET request
   - Workspace list GET request
   - Projects list GET request
   - Tasks list GET request
   - Task complete POST request
- [x] Write unit tests
- [x] Make popup mockup
- [x] Identify UI hierarchy (popup and options)
- [x] Static popup page (React, HTML)
- [x] Static options page (React, HTML)
- [x] CSS option and popup
- [x] Identify minimal state rep
- [x] Identify state location
- [x] Manual syncing
- [x] Task completion
- [x] Task due at date
- [x] Do something with sections
- [x] Handle long task names
- [x] Get proxima nova font (or suitable alternative)
- [x] Keyboard navigation
- [x] Ignore blank tasks
- [x] New icon
- [x] Undo complete notification
- [x] Give option to show all tasks or all assigned to a person
- [x] Style options page
- [x] Nicer syncing screen
- [x] Add a "Go here for your personal access token"
- [x] Confirm we fail gracefully
- [ ] Finish documentation
- [ ] Figure out submission to web store, then do it

### Post Launch
- [ ] Undoability
- [ ] Handle no-project tasks
- [ ] Handle subtasks
- [ ] Task tags
- [ ] Handle multiproject tasks


## Process Chain
- Asana-related state stored as struct
- update_state listens for an update event
- Every n mins, app fires an update event
- update_state:
   - Get logged-in Asana user ID and name
      - If user is not logged in, set logged_in to false and leave the Chain
      - If user is logged in, set logged_in to true and store their user ID
   - GET all Asana workspaces of current user (can't specify a user, defaults to logged in user I think)
   - For each workspace, GET the workspace's projects
   - For each project, GET the project's tasks
      - Loop through tasks, remove all completed tasks
         - If `include_unassigned` is `false`, remove all tasks assigned to `null`
         - Remove all tasks assigned to a user whose ID doesn't match `current_user.id`
   - Update state structure

## React hierarchy

- Extension
  - Header
  - TaskList
     - Task
        - TaskInfo

## Sample API Output

### User

`GET /users/me?opt_fields=id,name`

Output:
```JSON
{
  "data": {
    "id": 234234,
    "name": "Logged-In Name"
  }
}
```

### State

Model state (for tasks) should be structured as:

```JSON
{
   "workspaces": {
      WORKSPACE_NAME: {
         "id": WORKSPACE_ID,   
         "tasks": [{
            "id": TASK_ID,
            "name": TASK_NAME,
            "due_on": DUE_DATE,
            "due_at": DUE_TIME,
            "project": PROJECT_NAME
         }, {
            "id": TASK_ID,
            "name": TASK_NAME,
            "due_on": DUE_DATE,
            "due_at": DUE_TIME,
            "project": PROJECT_NAME
         }, {
            "id": TASK_ID,
            "name": TASK_NAME,
            "due_on": DUE_DATE,
            "due_at": DUE_TIME,
            "project": PROJECT_NAME
         }]
      }
   }
}
```

### Workspaces
`GET /workspaces?opt_fields=name,id&limit=10`

Output:
```JSON
{
  "data": [
    {
      "id": 17961646,
      "name": "Workspace A"
    },
    {
      "id": 2342342,
      "name": "Workspace B"
    }
  ],
  "next_page": null
}
```

### Projects
`GET /workspaces/<workspace_id>/projects?limit=10`

Output:
```JSON
{
  "data": [
    {
      "id": 341234,
      "name": "Project A"
    },
    {
      "id": 2333,
      "name": "Project B"
    }
  ],
  "next_page": null
}
```

### Tasks

`GET /projects/1796563471/tasks?opt_fields=name,completed,id,due_on,due_at,assignee&limit=10`

Output: 
```JSON
{
  "data": [
    {
      "id": 2342344,
      "name": "Section Task A:",
      "completed": false,
      "due_on": null,
      "due_at": null,
      "assignee": {
        "id": 2134234
      }
    },
    {
      "id": 234234,
      "name": "Task B",
      "completed": true,
      "due_on": "2016-06-12",
      "due_at": "2016-06-12T10:00:00.000Z",
      "assignee": null
    },
  ],
  "next_page": null
}
```

### Tech

ES6
Babel
Gulp
Browserify
SASS
HTML5
CSS3
localStorage
Chrome notifications
React.JS
REST API
Chrome Extension
npm
mocha
eslint
photoshop