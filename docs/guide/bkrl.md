# Blitzkrieg Ratings Leaderboard

A straightforward way of storing the entire World of Tanks Blitz ratings leaderboard to disk.

```cpp
primary BlitzkriegRatingsLeaderboard {
  utf8"BKRL" magic;
  Header header;
  primary Body<header> body;
}

Header {
  uint16 version; // always 1
  Format format;
  uint32 count;
}

Format enum<uint8> {
  Minimal,
  Comprehensive1,
}

Body<Header header> match<header.format> {
  Minimal {
    primary {
      uint32 id;
      uint16 score;
    }[header.count] entries;
  };

  Comprehensive1 {
    primary {
      uint32 id;
      uint16 score;

      uint32 battles;
      uint32 wins;
      uint32 survived;

      uint32 damageDealt;
      uint32 damageReceived;

      uint32 shots;
      uint32 hits;

      uint32 kills;
    }[header.count] entries;
  };
}
```