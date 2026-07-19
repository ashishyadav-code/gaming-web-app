const { connectDB } = require('./_utils/db')
const { verifyAdminToken, extractToken } = require('./_utils/auth')
const { ObjectId } = require('mongodb')

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: CORS, body: '' }
    }

    try {
        const db = await connectDB()
        const tourneys = db.collection('tournaments')

        if (event.httpMethod === 'GET') {
            const all = await tourneys.find({}).sort({ createdAt: -1 }).toArray()
            return {
                statusCode: 200,
                headers: CORS,
                body: JSON.stringify({
                    upcoming: all.filter(t => t.section === 'upcoming'),
                    running: all.filter(t => t.section === 'running'),
                    past: all.filter(t => t.section === 'past')
                })
            }
        }

        const data = JSON.parse(event.body)
        const { action, id, ...payload } = data

        // Public Player Registration
        if (action === 'register') {
            if (!id) throw new Error('Registration requires a tournament ID')
            const tourney = await tourneys.findOne({ _id: new ObjectId(id) })
            if (!tourney) throw new Error('Tournament not found')

            // Check Slot Limits
            const participantCount = (tourney.participants?.length || 0) + (tourney.pendingUnits?.length || 0)
            if (tourney.maxSlots && participantCount >= tourney.maxSlots) {
                throw new Error(`Tournament is FULL (${tourney.maxSlots} slots taken).`)
            }

            const isPaid = tourney.entryFee && tourney.entryFee.toLowerCase() !== 'free'

            if (isPaid) {
                // Add to pending list for admin approval
                await tourneys.updateOne(
                    { _id: new ObjectId(id) },
                    {
                        $addToSet: {
                            pendingUnits: {
                                ...payload.participant,
                                status: 'pending',
                                submittedAt: new Date()
                            }
                        }
                    }
                )
            } else {
                // Free tournament - direct entry
                await tourneys.updateOne(
                    { _id: new ObjectId(id) },
                    { $addToSet: { participants: payload.participant } }
                )
            }
            return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, isPaid }) }
        }

        // Admin Only Actions
        const token = extractToken(event.headers)
        const admin = verifyAdminToken(token)
        if (!admin) return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) }

        if (action === 'add') {
            await tourneys.insertOne({
                ...payload,
                participants: [],
                pendingUnits: [], // Added for approvals
                groups: [],
                matches: [],
                status: 'upcoming',
                createdAt: new Date()
            })
        } else if (action === 'update') {
            if (!id) throw new Error('Update requires an ID')
            await tourneys.updateOne(
                { _id: new ObjectId(id) },
                { $set: payload }
            )
        } else if (action === 'delete') {
            if (!id) throw new Error('Delete requires an ID')
            await tourneys.deleteOne({ _id: new ObjectId(id) })
        } else if (action === 'approveMember') {
            const { participant } = payload
            await tourneys.updateOne(
                { _id: new ObjectId(id) },
                {
                    $pull: { pendingUnits: { uid: participant.uid } },
                    $addToSet: { participants: participant }
                }
            )
        } else if (action === 'rejectMember') {
            const { uid } = payload
            await tourneys.updateOne(
                { _id: new ObjectId(id) },
                { $pull: { pendingUnits: { uid } } }
            )
        } else if (action === 'updateMatch') {
            // Update match draft
            const { matchIndex, matchData } = payload
            const field = `matches.${matchIndex}`
            await tourneys.updateOne(
                { _id: new ObjectId(id) },
                { $set: { [field]: matchData } }
            )
        } else if (action === 'lockMatch') {
            // Lock a match to prevent further edits
            const { matchIndex } = payload
            const field = `matches.${matchIndex}.isLocked`
            await tourneys.updateOne(
                { _id: new ObjectId(id) },
                { $set: { [field]: true } }
            )
        } else if (action === 'finalize') {
            const tourney = await tourneys.findOne({ _id: new ObjectId(id) })
            if (!tourney) throw new Error('Tournament not found')

            const aggStats = {} // { playerUidString: { kills: 0, ace: 0, matches: 0, name: string } }
            const lockedMatches = tourney.matches?.filter(m => m.isLocked) || []

            if (lockedMatches.length === 0) {
                throw new Error('No locked matches found to sync.')
            }

            // Aggregate per-player Wins and Runner-Ups
            lockedMatches.forEach(m => {
                // If there's a winner, assign +1 win to that group's players
                if (m.winnerTeamIdx !== undefined && m.winnerTeamIdx !== -1 && tourney.groups[m.winnerTeamIdx]) {
                    const winnerGroup = tourney.groups[m.winnerTeamIdx]
                    const winnerPlayers = winnerGroup.players || []
                    winnerPlayers.forEach(p => {
                        const uidStr = String(p.uid).trim()
                        if (!aggStats[uidStr]) aggStats[uidStr] = { kills: 0, ace: 0, matches: 0, name: p.name || 'Unknown', wins: 0, runnerUps: 0 }
                        aggStats[uidStr].wins = (aggStats[uidStr].wins || 0) + 1
                    })
                }

                // Any group that played but didn't win gets +1 Runner Up
                // Assuming "played" means having players in the `m.stats` array
                // Find all groups involved in this match
                const involvedGroups = new Set()
                if (m.stats) {
                    m.stats.forEach(s => {
                        // Find which group this player belongs to
                        const sUid = String(s.uid).trim()
                        tourney.groups.forEach((g, gIdx) => {
                            if (g.players && g.players.some(p => String(p.uid).trim() === sUid)) {
                                involvedGroups.add(gIdx)
                            }
                        })
                    })
                }

                // If they were involved but not the winner, they get a runner-up
                involvedGroups.forEach(gIdx => {
                    if (gIdx !== m.winnerTeamIdx && tourney.groups[gIdx]) {
                        const runnerUpGroup = tourney.groups[gIdx]
                        const runnerPlayers = runnerUpGroup.players || []
                        runnerPlayers.forEach(p => {
                            const uidStr = String(p.uid).trim()
                            if (!aggStats[uidStr]) aggStats[uidStr] = { kills: 0, ace: 0, matches: 0, name: p.name || 'Unknown', wins: 0, runnerUps: 0 }
                            aggStats[uidStr].runnerUps = (aggStats[uidStr].runnerUps || 0) + 1
                        })
                    }
                })
            })

            const members = db.collection('members')
            const report = { success: [], failed: [], winners: [], runners: [] }

            // 1. Sync All Stats (Base + Wins + RunnerUps) in ONE update call!
            for (const [uid, s] of Object.entries(aggStats)) {
                const uidNum = Number(uid)
                const query = isNaN(uidNum) ? { uid: uid } : { $or: [{ uid: uid }, { uid: uidNum }] }

                let incrementFields = {
                    "stats.tourney.kills": s.kills || 0,
                    "stats.tourney.ace": s.ace || 0,
                    "stats.tourney.matches": s.matches || 0,
                    "stats.tourney.wins": s.wins || 0,
                    "stats.tourney.runnerUps": s.runnerUps || 0
                }

                const updateRes = await members.updateOne(
                    query,
                    { $inc: incrementFields },
                    { upsert: false }
                )

                if (updateRes.modifiedCount > 0) {
                    report.success.push({ name: s.name, uid, kills: s.kills, wins: s.wins })
                    if (s.wins > 0) report.winners.push(s.name)
                    if (s.runnerUps > 0) report.runners.push(s.name)
                } else {
                    report.failed.push({ name: s.name, uid })
                }
            }

            await tourneys.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: { section: 'past', isSynced: true, syncReport: report },
                    $unset: { prediction: "" }
                }
            )

            return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, report }) }
        } else if (action === 'rebuildStats') {
            // Manually recalculate all player wins/runner-ups from every synced tournament
            const allPast = await tourneys.find({ section: 'past', isSynced: true }).toArray()
            const members = db.collection('members')
            const playerStats = {} // { uid: { wins, runnerUps } }

            allPast.forEach(t => {
                const lockedMatches = t.matches?.filter(m => m.isLocked) || []
                lockedMatches.forEach(m => {
                    // Winner
                    if (m.winnerTeamIdx !== undefined && m.winnerTeamIdx !== -1 && t.groups[m.winnerTeamIdx]) {
                        const winnerPlayers = t.groups[m.winnerTeamIdx].players || []
                        winnerPlayers.forEach(p => {
                            const uid = String(p.uid);
                            if (!playerStats[uid]) playerStats[uid] = { wins: 0, runnerUps: 0 }
                            playerStats[uid].wins += 1
                        })
                    }

                    // Runner Ups (anyone involved but not winner)
                    const involvedGroups = new Set()
                    m.stats?.forEach(s => {
                        const sUid = String(s.uid)
                        t.groups.forEach((g, gIdx) => {
                            if (g.players?.some(p => String(p.uid) === sUid)) involvedGroups.add(gIdx)
                        })
                    })

                    involvedGroups.forEach(gIdx => {
                        if (gIdx !== m.winnerTeamIdx && t.groups[gIdx]) {
                            const runnerPlayers = t.groups[gIdx].players || []
                            runnerPlayers.forEach(p => {
                                const uid = String(p.uid)
                                if (!playerStats[uid]) playerStats[uid] = { wins: 0, runnerUps: 0 }
                                playerStats[uid].runnerUps += 1
                            })
                        }
                    })
                })
            })

            // Update all players
            for (const [uid, stats] of Object.entries(playerStats)) {
                const uidNum = Number(uid)
                const query = isNaN(uidNum) ? { uid: uid } : { $or: [{ uid: uid }, { uid: uidNum }] }
                await members.updateOne(query, {
                    $set: { 
                        "stats.tourney.wins": stats.wins,
                        "stats.tourney.runnerUps": stats.runnerUps 
                    }
                })
            }

            return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, count: Object.keys(playerStats).length }) }
        }

        return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) }
    } catch (err) {
        return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) }
    }
}
