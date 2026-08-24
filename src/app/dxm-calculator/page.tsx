import { redirect } from "next/navigation";

/**
 * Legacy URL kept alive after the calculators moved to /calculators/*.
 * With `output: "export"` there is no server to handle redirects(), so this
 * page bakes a build-time HTML redirect (meta refresh) to the new location.
 */
export default function DexmCalculatorRedirect() {
  redirect("/calculators/dxm");
}
