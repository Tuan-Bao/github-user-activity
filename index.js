const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("github-activity ", (username) => {
  if (!username) {
    console.error("Error: No username provided.");
    rl.close();
    process.exit(1);
  }

  fetchGitHubUserActivity(username)
    .then((events) => {
      displayEvent(events);
      rl.close();
    })
    .catch((err) => {
      console.error(err.message);
      rl.close();
      process.exit(1);
    });
});

const fetchGitHubUserActivity = async (username) => {
  const response = await fetch(
    `https://api.github.com/users/${username}/events`,
    {
      headers: {
        Accept: "application/vnd.github + json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("User not found. Please check the username.");
    } else {
      throw new Error(
        `Something went wrong. Error fetching data: ${response.status}.`
      );
    }
  }

  return response.json();
};

const displayEvent = (events) => {
  if (events.length === 0) {
    console.log("No recent activity found.");
    return;
  }

  events.forEach((event) => {
    let action;
    switch (event.type) {
      case "PushEvent":
        const commitCount = event.payload.commits.length;
        action = `Pushed ${commitCount} commit(s) to ${event.repo.name}`;
        break;
      case "IssuesEvent":
        action = `${
          event.payload.action.charAt(0).toUpperCase() +
          event.payload.action.slice(1)
        } an issue in ${event.repo.name}`;
        break;
      case "WatchEvent":
        action = `Starred ${event.repo.name}`;
        break;
      case "ForkEvent":
        action = `Forked ${event.repo.name}`;
        break;
      case "CreateEvent":
        action = `Created ${event.payload.ref_type} in ${event.repo.name}`;
        break;
      default:
        action = `${event.type.replace("Event", "")} in ${event.repo.name}`;
        break;
    }
    console.log(`- ${action}`);
  });
};
