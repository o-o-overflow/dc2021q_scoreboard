import React from "react";

function Rules() {
  return (
    <div className="rulespage">
      <h2>Basic Rules</h2>
      <ul>
        <li>
          No Denial of Service—DoS is super lame, don't do it or you will be
          banned
        </li>
        <li>No sharing flags, exploits, or hints—Do your own hacks</li>
        <li>
          No attacks against our infrastructure—Hack the challenges, not us
        </li>
        <li>No automated scanning—For these challenges, do better</li>
      </ul>

      <h2>Scoring</h2>
      <p>
        We do adaptive scoring based on the number of solves:
        starting at 500 and decreasing from there (based on the total number of
        teams that solved the challenge).
      </p><p>We{" "}
        <a href="https://github.com/o-o-overflow/scoring-playground">
          released a scoring playground
        </a>{" "}
        so that teams with questions or concerns about the exact scoring
        algorithm can see how that affects the overall ranking.
      </p>


      <h2>Flag Format</h2>
      <p>
        Unless otherwise noted, all flags will be in the format: <code>OOO&#123;…&#125;</code>
      </p>
      <p>
        <strong>
          <em>
            NOTE: You must submit the whole thing, including the{" "}
            <code>OOO&#123;…&#125;</code>.
          </em>
        </strong>
      </p>

      <h2>Proof of Work (POW)</h2>
      <p>
        We may implement a POW in front of a challenge if we feel it is
        necessary.

        <p>Please don't make it necessary</p>
      </p>

      <h2>Hints</h2>
      <p>
        Do not expect hints. Particularly if a service is already pwned, it
        would be unfair to give one team a hint when it's already solved.
      </p><p>We do appreciate issue reports and if we
        feel that something is significantly wrong, then we will update the
        description and tweet about it. If you straight up ask for hints on <del>IRC</del>{" "}
        or discord, expect to be referred to this page.
      </p>

      <h2>
        Twitter and <del>IRC</del>discord
      </h2>
      <p>
        <b>All game announcements will be made through our Twitter account{" "}
        <a href="https://twitter.com/oooverflow">@oooverflow</a></b>
      </p>
      <p>
        Times change, and we must change with them.
        We're <a href="https://twitter.com/oooverflow/status/1384622113785475072">in hybrid mode</a> like DEF CON and use its official
        discord <a href="https://discord.gg/defcon">discord.gg/defcon</a>.
        You should hang out with us in the CTF area (all the way to the bottom).
      </p>

      <h2>Flag Submission Delay</h2>
      <p>Flags can be submitted once every 30 seconds per challenge.</p>

      <h2>Team Size</h2>
      <p>There is no limit on team sizes.</p>

      <h2>Info on prequals, etc.</h2>
      <p>See <a href="https://oooverflow.io/dc-ctf-2021-quals/">our main website</a>.</p>

      <h2>Who are you anyway?</h2>
      <p>We are the Order of the Overflow. We are the current host of <a href="https://www.defcon.org/html/links/dc-ctf.html">DEF CON CTF</a> (Quals and Finals).</p>
      <p>Info about us and our philosophy is <a href="https://oooverflow.io/philosophy.html">here</a> and we're reachable at <a href="mailto:team@oooverflow.io">team@oooverflow.io</a>.</p>

      <h2>OMG I'm insanely confused</h2>
      <p>It's a hacking competition, and the DEF CON CTF is a hard one at that.</p>
      <p>You might want to start with something easier, maybe from our <a href="https://archive.ooo">archive</a> -- <a href="https://github.com/o-o-overflow/archiveooo/wiki/FAQ">more info</a>.</p>
    </div>
  );
}
export default Rules;
