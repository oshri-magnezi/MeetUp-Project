import React, { createContext, useState, useContext } from 'react';

/* ─────────────────────────────────────────────
   MeetupContext.jsx — central store for MeetUp
───────────────────────────────────────────── */

const MeetupContext = createContext();

export const MeetupProvider = ({ children }) => {
  // Starts empty — content is created from the Dashboard.
  const [meetups, setMeetups] = useState([]);

  // Add a new meetup (called from Dashboard).
  const addMeetup = (newMeetup) => {
    setMeetups((prev) => [...prev, newMeetup]);
  };

  // Confirm attendance — increments `registered` up to `maxAttendees`.
  // NOTE: fields are `registered` / `maxAttendees` to match Home.jsx &
  // Dashboard.jsx (the previous version used participants/maxParticipants,
  // which silently no-op'd because those keys never existed on the objects).
  const joinMeetup = (id) => {
    setMeetups((prev) =>
      prev.map((meetup) =>
        meetup.id === id && meetup.registered < meetup.maxAttendees
          ? { ...meetup, registered: meetup.registered + 1 }
          : meetup
      )
    );
  };

  return (
    <MeetupContext.Provider value={{ meetups, addMeetup, joinMeetup }}>
      {children}
    </MeetupContext.Provider>
  );
};

// Convenience hook for components.
export const useMeetups = () => useContext(MeetupContext);