/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { GetFeed, GethDAOFeed, GetRandomFeed } from "../../data/api";
import { useInterval } from "../../hooks/useInterval";
import { Page, Container, Padding } from "../../components/layout";
import { FeedItem } from "../../components/feed-item";
import { Loading } from "../../components/loading";
import { Button, Primary } from "../../components/button";
import styles from "./index.module.scss";

const customFloor = function (value, roundTo) {
  return Math.floor(value / roundTo) * roundTo;
};

const ONE_MINUTE_MILLIS = 60 * 1000;
const SLIDE_SHOW_DELAY = 15 * 1000;

export const Random = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [feedType, setFeedType] = useState(1);
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [slideShowIndex, setSlideShowIndex] = useState(0);
  const [slideShowisRunning, setSlideShowisRunning] = useState(false);
  const startTime = customFloor(Date.now(), ONE_MINUTE_MILLIS);

  const loadMore = () => {
    setCount(count + 1);
  };

  useEffect(() => {
    if (error) {
      console.log("returning on error");
      return;
    }

    if (feedType === 0) {
      console.log("hDAO feed");
    } else {
      console.log("latest feed");

      setLoading(true);
      // api
      GetRandomFeed({ counter: count })
        .then((result) => {
          // filtered isn't guaranteed to always be 10. if we're filtering they might be less.
          console.log(result);
          const next = items.concat(result);
          setItems(next);
          setLoading(false);
          // if original returns less than 30, then there's no more data coming from API
          if (result.length < 30) {
            setHasMore(false);
          }
        })
        .catch((e) => {
          setError(true);
          setLoading(false);
        });
    }
  }, [count, feedType]);

  const toggleFeed = (index) => {
    setFeedType(index);
    setCount(0);
    setItems([]);
    setHasMore(true);
  };

  const getBottomStatus = () => {
    if (slideShowisRunning) {
      return <></>;
    }
    return (
      <>
        {hasMore ? (
          <Button onClick={loadMore}>
            <Primary>
              <strong>Load More</strong>
            </Primary>
          </Button>
        ) : (
          <p>
            mint mint mint{" "}
            <span role="img" aria-labelledby={"Sparkles emoji"}>
              ✨
            </span>
          </p>
        )}
      </>
    );
  };

  //for slide show mode
  const onNextObjkt = () => {
    if (slideShowIndex < items.length - 1) {
      setSlideShowIndex(slideShowIndex + 1);
    } else {
      setSlideShowisRunning(false);
      setSlideShowIndex(0);
      loadMore();
      setCount(count + 1);
    }
  };

  const getFeedDisplayIcon = () =>
    items.length > 0 ? (
      <div
        style={{ paddingLeft: 200, cursor: "pointer" }}
        onClick={() => setSlideShowisRunning(!slideShowisRunning)}
      >
        {slideShowisRunning ? "〓" : "⿴"}
      </div>
    ) : (
      <div></div>
    );

  useInterval(onNextObjkt, slideShowisRunning ? SLIDE_SHOW_DELAY : null);

  return (
    <Page>
      {false && (
        <div className={styles.sticky}>
          <div className={styles.content}>
            <Button onClick={() => toggleFeed(0)}>
              <Primary selected={feedType === 0}>hDAO</Primary>
            </Button>
            <Button onClick={() => toggleFeed(1)}>
              <Primary selected={feedType === 1}>latest</Primary>
            </Button>
          </div>
        </div>
      )}

      {getFeedDisplayIcon()}

      {slideShowisRunning ? (
        <FeedItem
          key={`${items[slideShowIndex].token_id}-${slideShowIndex}`}
          {...items[slideShowIndex]}
        />
      ) : (
        items.map((item, index) => (
          <FeedItem key={`${item.token_id}-${index}`} {...item} />
        ))
      )}
      {loading ? (
        <Container>
          <Padding>
            <Loading />
          </Padding>
        </Container>
      ) : (
        <Container>
          <Padding>{getBottomStatus()}</Padding>
        </Container>
      )}
    </Page>
  );
};
