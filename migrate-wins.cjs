// Run via: node migrate-wins.js
const fs = require('fs')
const path = require('path')
const { MongoClient } = require('mongodb')

// Manual .env parsing
let uri = '';
try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/MONGODB_URI=(.*)/);
        if (match) uri = match[1].trim();
    }
} catch (e) {
    console.warn("Could not read .env manually", e);
}

if (!uri) {
    console.error("Missing MONGODB_URI in .env")
    process.exit(1)
}

async function run() {
    const client = new MongoClient(uri)
    try {
        await client.connect()
        console.log("Connected to MongoDB")
        const db = client.db()
        const tourneysCol = db.collection('tournaments')
        const membersCol = db.collection('members')

        // Fetch all past tournaments that were already synced
        const pastTourneys = await tourneysCol.find({ section: 'past', isSynced: true }).toArray()
        console.log(`Found ${pastTourneys.length} past synced tournaments.`)

        if (pastTourneys.length === 0) {
            console.log("No past tournaments to migrate.")
            process.exit(0)
        }

        const playerWins = {} // uid string -> wins to add

        for (const tourney of pastTourneys) {
            console.log(`Processing tournament: ${tourney.title}`)
            const lockedMatches = tourney.matches?.filter(m => m.isLocked) || []
            
            for (const m of lockedMatches) {
                // Determine if there was a winner
                if (m.winnerTeamIdx !== undefined && m.winnerTeamIdx !== -1 && tourney.groups[m.winnerTeamIdx]) {
                    const winnerGroup = tourney.groups[m.winnerTeamIdx]
                    const winnerPlayers = winnerGroup.players || []
                    
                    winnerPlayers.forEach(p => {
                        const uidStr = String(p.uid).trim()
                        if (!playerWins[uidStr]) playerWins[uidStr] = 0
                        playerWins[uidStr] += 1
                    })
                }
            }
        }

        console.log("Calculated missing wins:", playerWins)

        let successCount = 0
        
        // Loop through all calculated wins and apply them
        // Note: we can't be sure if they ALREADY have wins, but since the previous logic was broken
        // and only granted them to the OVERALL winner (and even then maybe buggy), we will 
        // completely override the 'stats.tourney.wins' value to be accurate, OR we can just add.
        // Let's assume the previous was mostly 0, so we just $set or $inc. The safest is to 
        // recalculate from scratch and $set.

        for (const [uid, calculatedWins] of Object.entries(playerWins)) {
            const uidNum = Number(uid)
            const query = isNaN(uidNum) ? { uid: uid } : { $or: [{ uid: uid }, { uid: uidNum }] }

            // Fetch current stats first to see what they have
            const member = await membersCol.findOne(query)
            if (member) {
                // Let's perform a direct $set to ensure it's perfectly accurate to the history
                await membersCol.updateOne(query, {
                    $set: { "stats.tourney.wins": calculatedWins }
                })
                successCount++
                console.log(`Updated UID ${uid} (${member.name}) with ${calculatedWins} wins.`)
            } else {
                console.log(`Player UID ${uid} not found in members collection.`)
            }
        }

        console.log(`Migration complete. Updated ${successCount} members.`)

    } catch (err) {
        console.error("Migration failed:", err)
    } finally {
        await client.close()
    }
}

run()
