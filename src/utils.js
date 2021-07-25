import {last, dropLastWhile} from "ramda";

function jsonDeepClone(json) {
  return JSON.parse(JSON.stringify(json));
}

function peek(a) {
  return a.slice(-1)[0];
}

// All of the computations in every
// stepper have completed, so
// we squash down to a bare environment
// awaiting further user input.
const getFinishedMoment = (e, newOutput) => {
  const newEnv = jsonDeepClone(e);
  newEnv["Input"] = [];
  newEnv["InputIndex"] = 0;
  newEnv["mode"] = "Execute";

  return {
    mode: "pause",
    environments: [newEnv],
    output: newOutput,
  };
};

// Some steppers remain unfinished,
// so we generate a moment containing only those
// remaining steppers.
const getCollapsedMoment = (finalEnvironment, remainingEnvironments, newOutput) => {
  const newHeadEnv = jsonDeepClone(peek(remainingEnvironments));
  newHeadEnv["DataStack"] = finalEnvironment["DataStack"];
  newHeadEnv["WordDict"] = finalEnvironment["WordDict"]
  newHeadEnv["InputIndex"] += 1;
  newHeadEnv["mode"] = last(remainingEnvironments)["mode"];
  return {
    mode: "debug",
    environments: remainingEnvironments.slice(0, -1).concat(newHeadEnv),
    output: newOutput
  };
};

//Drop all environments that have reached the end of their input.
//If all environments have reached the end, leave the final environment
//in place devoid of input.
const collapseEnvironments = (curEnvironments, newOutput) => {
  const finalEnvironment = curEnvironments.slice(-1)[0];
  const remainingEnvironments = dropLastWhile(
    env => env["InputIndex"] >= env["Input"].length - 1,
    curEnvironments)
  
  if (remainingEnvironments.length === 0) {
    return getFinishedMoment(finalEnvironment, newOutput)
  } else {
    return getCollapsedMoment(finalEnvironment, remainingEnvironments, newOutput);
  }
};

// Merge new environment into current set of environments.
const getNewMoment = (now, newEnvironment, curInput) => {
  const inputIsComplete = newEnvironment["InputIndex"] >= newEnvironment["Input"].length;
  const curEnvironments = now.environments.slice(0, -1).concat(newEnvironment);
  const newOutput = newEnvironment["Output"] !== ""
    ? now.output.concat(newEnvironment["Output"].split("\n"))
    : now.output;

  if (inputIsComplete) {
    return collapseEnvironments(curEnvironments, newOutput)
  } else {
    return { mode: "debug", output: newOutput, environments: curEnvironments };
  }
};

export { getNewMoment, jsonDeepClone, peek };
