module.exports = {
    server: {
        output: 'server.output',
        start: 'server.start',
        stop: 'server.stop'
    },
    car: {
        connect: 'car.connect',
        disconnect: 'car.disconnect'
    },
    lap: {
        time: 'lap.time',
        best: 'lap.best'
    },
    track: {
        dynamic: 'track.dynamic'
    },
    session: {
        next: 'session.next',
        end: 'session.end'
    },
    race: {
        end: 'race.end'
    }
}