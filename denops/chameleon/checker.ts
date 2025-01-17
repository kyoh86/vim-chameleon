const decoder = new TextDecoder();

export type Background = "light" | "dark";

function getChecker(): (
  options: { signal?: AbortSignal },
) => Promise<Background> {
  switch (Deno.build.os) {
    case "darwin": {
      return checkDarkmodeDarwin;
    }
    case "linux": {
      return checkDarkmodeLinux;
    }
    case "windows": {
      return checkDarkmodeWindows;
    }
    default: {
      console.warn(`Unsupported OS: ${Deno.build.os}`);
      return () => Promise.resolve("dark");
    }
  }
}

async function checkDarkmodeDarwin(
  { signal }: { signal?: AbortSignal },
): Promise<Background> {
  const cmd = new Deno.Command("defaults", {
    args: ["read", "-g", "AppleInterfaceStyle"],
    stdin: "null",
    stdout: "piped",
    stderr: "null",
    signal,
  });
  const { success, stdout } = await cmd.output();
  if (success) {
    return decoder.decode(stdout).trim() === "Dark" ? "dark" : "light";
  }
  // The command fails with "The domain/default pair of (kCFPreferencesAnyApplication, AppleInterfaceStyle) does not exist"
  // if the system is in light mode.
  return "light";
}

function checkDarkmodeLinux(
  _options: { signal?: AbortSignal },
): Promise<Background> {
  console.warn(`Linux is not supported yet. PR is welcome!`);
  return Promise.resolve("dark");
}

function checkDarkmodeWindows(
  _options: { signal?: AbortSignal },
): Promise<Background> {
  console.warn(`Windows is not supported yet. PR is welcome!`);
  return Promise.resolve("dark");
}

export const check = getChecker();
