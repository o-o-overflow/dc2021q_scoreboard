#!/usr/bin/env python3
from contextlib import contextmanager
import base64
import json
import pprint
import sys

import boto3
import psycopg2
import yaml
import datetime

DB_HOST = {
    "dev": "sb-dev.cgwgx6ftjwg2.us-east-2.rds.amazonaws.com",
    "prod": "sb-prod.cgwgx6ftjwg2.us-east-2.rds.amazonaws.com",
}


ENVIRONMENT = "prod"


def decrypt_secrets():
    session = boto3.session.Session(profile_name="ooo")
    kms = session.client("kms")
    with open(
        "scoreboard_backend/kms-secrets.{}.us-east-2.yml".format(ENVIRONMENT)
    ) as fp:
        encrypted = yaml.safe_load(fp)["secrets"]["SECRETS"]
    data = base64.b64decode(encrypted)
    return json.loads(kms.decrypt(CiphertextBlob=data)["Plaintext"].decode("utf-8"))


def main(argv):
    db_password = decrypt_secrets()["DB_PASSWORD"]

    if len(argv) == 1:
        with psql_connection(db_password) as psql:
            stats(psql)
    elif argv[1] == "timeline":
        with psql_connection(db_password) as psql:
            timeline(psql)
    elif argv[1] == "challs":
        with psql_connection(db_password) as psql:
            challs_table(psql)
    elif argv[1] == "teams":
        with psql_connection(db_password) as psql:
            teams_table(psql)
    elif argv[1] == "cinfo":
        if len(argv) != 3:
            print("You need to specify one challenge id")
            sys.exit(1)
        with psql_connection(db_password) as psql:
            info_chall(psql, argv[2])
    elif argv[1] == "last":
        if len(argv) != 3:
            n = 20
        else:
            n = int(argv[2])
        with psql_connection(db_password) as psql:
            last(psql, n)
    elif argv[1] == "tinfo":
        if len(argv) != 3:
            print("You need to specify one team id")
            sys.exit(1)
        with psql_connection(db_password) as psql:
            info_team(psql, argv[2])
    elif argv[1] == "teacheck":
        with psql_connection(db_password) as psql:
            teacheck(psql)
    else:
        print("\nUse:")
        print(
            " %s               \x1b[33m# Generic Info about the game\x1b[0m" % argv[0]
        )
        print(" %s challs        \x1b[33m# Info about open challengs\x1b[0m" % argv[0])
        print(" %s last <n>      \x1b[33m# List of last n solutions\x1b[0m" % argv[0])
        print(" %s teams         \x1b[33m# Info about all teams\x1b[0m" % argv[0])
        print(
            " %s cinfo <chall> \x1b[33m# Detailed info about one chall\x1b[0m" % argv[0]
        )
        print(
            " %s tinfo <team>  \x1b[33m# Provides info about one team\x1b[0m" % argv[0]
        )
        print(
            " %s timeline      \x1b[33m# Prints a hourly timeline of the game\x1b[0m"
            % argv[0]
        )
        print("")
        sys.exit(0)

    return 0


def diff_string(diff):
    last = ""
    diff_days = diff.days
    diff_m = diff.seconds // 60
    diff_h = diff_m // 60
    if diff_days > 0:
        last += "%dd " % diff_days
    if int(diff_h) > 0:
        diff_m %= 60
        last += "%dh %dm" % (diff_h, diff_m)
    else:
        last += "%dm" % diff_m
    return last


@contextmanager
def psql_connection(db_password):
    psql = psycopg2.connect(
        dbname="scoreboard",
        host=DB_HOST[ENVIRONMENT],
        password=db_password,
        user="dc2019qmaster",
    )
    try:
        yield psql
    finally:
        psql.close()


def last(psql, n):
    with psql.cursor() as cursor2:
        cursor2.execute(
            "SELECT solves.date_created, team_name, challenge_id FROM solves,users WHERE solves.user_id = users.id order by solves.date_created desc limit %d;"
            % n
        )
        for time, team, chall in cursor2.fetchall():
            print("\x1b[32m %35s \x1b[0m from %s" % (chall, team))


def info_team(psql, team):
    with psql.cursor() as cursor2:
        cursor2.execute("SELECT id FROM users WHERE team_name=%s;", (team,))
        team_id = cursor2.fetchone()
        if not team_id:
            print("  Error: team %s not found" % team)
            sys.exit(2)
        else:
            team_id = team_id[0]
    now = datetime.datetime.now(datetime.timezone.utc)
    print("")
    print("\x1b[32m----------------------------------------------------------\x1b[0m")
    print("\x1b[32m        Challenge       Wront Attempts     Solved \x1b[0m ")
    with psql.cursor() as cursor:
        cursor.execute("SELECT id from challenges;")
        for (name,) in cursor.fetchall():
            with psql.cursor() as cursor2:
                cursor2.execute(
                    "SELECT solves.date_created FROM solves WHERE challenge_id=%s and user_id=%s;",
                    (name, team_id),
                )
                when = cursor2.fetchone()
                if when == None:
                    when = "   -"
                else:
                    diff = now - when[0]
                    when = diff_string(diff)
            with psql.cursor() as cursor2:
                cursor2.execute(
                    "SELECT count(*) FROM submissions WHERE challenge_id=%s and user_id=%s;",
                    (name, team_id),
                )
                wrong = cursor2.fetchone()
                if not wrong or wrong[0] == 0:
                    wrong = "-"
                else:
                    wrong = wrong[0]
            print("\x1b[33m%20s\x1b[0m         %3s          %s" % (name, wrong, when))
    print("\x1b[32m----------------------------------------------------------\x1b[0m")
    print("")


def timeline(psql):
    now = datetime.datetime.now(datetime.timezone.utc)
    start = datetime.datetime(2019, 5, 11, 0, 0, 0, tzinfo=datetime.timezone.utc)
    slots = [[0, set()] for i in range(49)]
    diff = now - start
    current = int(diff.total_seconds() // 60 // 60)
    print("\x1b[32mHour      Correct Submissions    Active Teams\x1b[0m")
    with psql.cursor() as cursor2:
        cursor2.execute("SELECT solves.date_created, user_id FROM solves;")
        for when, who in cursor2.fetchall():
            diff = when - start
            slot = int(diff.total_seconds() // 60 // 60)
            slots[slot][0] += 1
            slots[slot][1].add(who)

    for i in range(len(slots)):
        if i == current:
            print(
                "\x1b[32mNOW>\x1b[0m           %5s               %5s"
                % (slots[i][0], len(slots[i][1]))
            )
        else:
            print(
                " %2d            %5s               %5s"
                % (i, slots[i][0], len(slots[i][1]))
            )


def info_chall(psql, chall):
    now = datetime.datetime.now(datetime.timezone.utc)
    with psql.cursor() as cursor2:
        cursor2.execute("SELECT date_created FROM challenges WHERE id=%s;", (chall,))
        opentime = cursor2.fetchone()
        if not opentime:
            print("  Error: challenge not found or not yet open")
            sys.exit(2)
        else:
            opentime = opentime[0]
    print("")
    print("\x1b[32m----------------------------------\x1b[0m")
    diff = now - opentime
    when = diff_string(diff)
    print("\x1b[32m Open Time:\x1b[0m %s ago" % when)
    with psql.cursor() as cursor2:
        cursor2.execute(
            "SELECT solves.date_created, team_name FROM solves,users WHERE solves.user_id = users.id and challenge_id=%s;",
            (chall,),
        )
        solvedby = cursor2.fetchall()
        if len(solvedby) == 0:
            print("\x1b[32m Solved by:\x1b[0m no one yet")
        else:
            solvedby.sort(key=lambda x: x[0])
            print("\x1b[32m Solved by:\x1b[0m %d teams" % len(solvedby))
            print("\x1b[32m First Solved by:\x1b[0m %s" % solvedby[0][1])
            diff = solvedby[0][0] - opentime
            when = diff_string(diff)
            print("\x1b[32m                 \x1b[0m %s after it was open" % when)
            print("\x1b[32m Last 3 teams that solved it:\x1b[0m")
            for solver in solvedby[-3:][::-1]:
                diff = now - solver[0]
                when = diff_string(diff)
                print("      %s, %s ago" % (solver[1], when))

    with psql.cursor() as cursor2:
        cursor2.execute(
            "SELECT submissions.date_created, team_name, flag FROM submissions,users WHERE submissions.user_id = users.id and challenge_id=%s;",
            (chall,),
        )
        errors = cursor2.fetchall()
        if len(errors) == 0:
            print("\x1b[32m Wrong Flag Submitted:\x1b[0m none")
        else:
            errors.sort(key=lambda x: x[0])
            print("\x1b[32m Wrong Flag Submitted:\x1b[0m %d" % len(errors))
            print("\x1b[32m Last 10 wrong submissions:\x1b[0m")
            for when, team, flag in errors[-10:][::-1]:
                diff = now - when
                when = diff_string(diff)
                print("      '%s' from %s, %s ago" % (flag, team, when))
    print("\x1b[32m----------------------------------\x1b[0m")
    print("")


def challs_table(psql):
    print("")
    print(
        "\x1b[32m           Name       : Status  Solved  Wrong    Last  Open Since\x1b[0m"
    )
    print(
        "\x1b[32m-----------------------------------------------------------------\x1b[0m"
    )
    now = datetime.datetime.now(datetime.timezone.utc)
    with psql.cursor() as cursor:
        cursor.execute("SELECT id from challenges;")
        for (name,) in cursor.fetchall():
            with psql.cursor() as cursor2:
                cursor2.execute(
                    "SELECT max(solves.date_created), count(user_id) FROM solves WHERE challenge_id=%s;",
                    (name,),
                )
                last, tot = cursor2.fetchone()
            with psql.cursor() as cursor2:
                cursor2.execute(
                    "SELECT count(*) FROM submissions WHERE challenge_id=%s;", (name,)
                )
                wrong, = cursor2.fetchone()
            if last == None:
                last = "   -"
            else:
                diff = now - last
                last = diff_string(diff)
            with psql.cursor() as cursor2:
                cursor2.execute(
                    "SELECT date_created FROM challenges WHERE id=%s;", (name,)
                )
                openfrom = "X"
                opentime = cursor2.fetchone()[0]
                diff = now - opentime
                openfrom = diff_string(diff)
            print(
                "\x1b[33m%20s\x1b[0m  :  OPEN    %3s    %5s %7s  %10s"
                % (name, tot, wrong, last, openfrom)
            )

    with psql.cursor() as cursor:
        cursor.execute("SELECT id from unopened_challenges;")
        for name in cursor.fetchall():
            print("%20s  :  CLOSE     -        -       -" % name)
    print("")


def teacheck(psql):
    with psql.cursor() as cursor:
        # cursor.execute('SELECT id,team_name FROM users;')
        # for (team_id,team_name) in cursor.fetchall():
        #    print ('ID: %s, team: %s' % (team_id, team_name))
        cursor.execute(
            "SELECT date_created, user_id, challenge_id, flag FROM submissions WHERE challenge_id='throwback' and user_id=177;"
        )
        for (date_created, user_id, challenge_id, flag) in cursor.fetchall():
            print('Time: %s, flag: "%s"' % (date_created, flag))


def stats(psql):
    with psql.cursor() as cursor:
        cursor.execute("SELECT count(*) from users;")
        total = cursor.fetchone()[0]

    with psql.cursor() as cursor:
        cursor.execute("SELECT count(*) from solves;")
        tsolved = cursor.fetchone()[0]

    with psql.cursor() as cursor:
        cursor.execute("SELECT count(distinct(challenge_id)) from solves;")
        usolved = cursor.fetchone()[0]

    with psql.cursor() as cursor:
        cursor.execute("SELECT count(*) from submissions;")
        flags = cursor.fetchone()[0]

    with psql.cursor() as cursor:
        cursor.execute("SELECT count(*) from challenges;")
        open = cursor.fetchone()[0]

    with psql.cursor() as cursor:
        cursor.execute("SELECT count(*) from unopened_challenges;")
        closed = cursor.fetchone()[0]

    with psql.cursor() as cursor:
        cursor.execute("SELECT count(distinct(user_id)) from solves;")
        active = cursor.fetchone()[0]

    with psql.cursor() as cursor:
        cursor.execute("SELECT count(*) as c from solves group by user_id order by c;")
        max_solved = cursor.fetchall()
        if not max_solved:
            max_solved = 0
        else:
            max_solved = max_solved[-1][0]

    now = datetime.datetime.now(datetime.timezone.utc)
    start = datetime.datetime(2019, 5, 11, 0, 0, 0, tzinfo=datetime.timezone.utc)
    diff = now - start
    diffm = diff.days * 24 * 60 + diff.seconds // 60
    progress = diffm * 100 / (48 * 60)
    diffs = diff_string(now - start)
    print("")
    print("\x1b[32m----------------------------------\x1b[0m")
    print("\x1b[32m Game Time\x1b[0m:           %7s (%d%%)" % (diffs, int(progress)))
    print("\x1b[32m Total Teams\x1b[0m:         %7s" % total)
    print("\x1b[32m Active Teams\x1b[0m:        %7s" % active)
    print(
        "\x1b[32m Open Challenges\x1b[0m:     %7s (%d%%)"
        % (open, open * 100 / (open + closed))
    )
    print("\x1b[32m Solved Challenges\x1b[0m:   %7s" % usolved)
    print("\x1b[32m Correct Submissions\x1b[0m: %7s" % tsolved)
    print("\x1b[32m Buffer\x1b[0m:              %7s" % (open - max_solved,))
    print("\x1b[32m Wrong Flags\x1b[0m:         %7s" % flags)
    print("\x1b[32m----------------------------------\x1b[0m")
    print("  (for more options use %s -h )" % sys.argv[0])
    print("")


def teams_table(psql):
    print("")
    print("\x1b[32m           Name       : Solved  Wrong    Last \x1b[0m")
    print("\x1b[32m-------------------------------------------------------\x1b[0m")
    now = datetime.datetime.now(datetime.timezone.utc)
    flags = {}
    with psql.cursor() as cursor:
        cursor.execute(
            "SELECT count(submissions.date_created), team_name FROM submissions, users WHERE submissions.user_id = users.id group by team_name;"
        )
        for count, team in cursor.fetchall():
            flags[team] = count

    with psql.cursor() as cursor:
        # cursor.execute('SELECT solves.date_created, challenge_id, team_name FROM solves, users WHERE solves.user_id = users.id;')
        cursor.execute(
            "SELECT max(solves.date_created), count(challenge_id), team_name FROM solves, users WHERE solves.user_id = users.id group by team_name;"
        )
        for last, solved, team in cursor.fetchall():
            now = datetime.datetime.now(datetime.timezone.utc)
            if last == None:
                last = "   -"
            else:
                diff = now - last
                last = diff_string(diff)
            print(
                "%20s  :  %3s    %3s    %s" % (team, solved, flags.get(team, 0), last)
            )

    print("")


if __name__ == "__main__":
    sys.exit(main(sys.argv))
