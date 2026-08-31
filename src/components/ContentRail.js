import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ContentCard } from './ContentCard';
import { tokens } from '../theme/tokens';
import { isTouchDevice, pageGutter } from '../utils/layout';

export function ContentRail({ row, onOpen, technical = false }) {
  const rail = useRef(null);
  const dragged = useRef(false);
  const { width } = useWindowDimensions();
  const [offset, setOffset] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [active, setActive] = useState(false);
  if (!row?.items?.length) return null;

  const gutter = pageGutter(width);
  const maxOffset = Math.max(0, contentWidth - viewportWidth);
  const hasOverflow = maxOffset > 2;
  const arrows = width >= 1024 && !isTouchDevice() && hasOverflow;
  const atStart = offset <= 2;
  const atEnd = offset >= maxOffset - 2;
  const gap = width < 600 ? 12 : width < 1024 ? 14 : width < 1600 ? 16 : 18;
  const titleStyle = width < 600 ? s.phoneTitle : width < 1024 ? s.tabletTitle : s.desktopTitle;
  const move = direction => rail.current?.scrollTo?.({
    x: Math.min(maxOffset, Math.max(0, offset + direction * Math.max(320, width * .72))),
    animated: true,
  });
  const open = item => { if (!dragged.current) onOpen(item); };

  return <View
    style={[s.section, width < 600 ? s.phoneSection : width < 1024 ? s.tabletSection : s.desktopSection, technical && s.technical]}
    onPointerEnter={() => setActive(true)}
    onPointerLeave={() => setActive(false)}
  >
    <View style={[s.head, { paddingHorizontal: gutter }]}>
      <Text accessibilityRole="header" style={[s.title, titleStyle]}>{row.title}</Text>
      {row.nextCursor ? <Pressable accessibilityRole="button"><Text style={s.view}>View all</Text></Pressable> : null}
    </View>
    <View style={s.railWrap} onFocus={() => setActive(true)} onBlur={() => setActive(false)}>
      <ScrollView
        ref={rail}
        onLayout={event => setViewportWidth(event.nativeEvent.layout.width)}
        onContentSizeChange={nextWidth => setContentWidth(nextWidth)}
        onScrollBeginDrag={() => { dragged.current = true; }}
        onMomentumScrollEnd={() => { dragged.current = false; }}
        onScrollEndDrag={() => setTimeout(() => { dragged.current = false; }, 100)}
        onScroll={event => setOffset(event.nativeEvent.contentOffset.x)}
        scrollEventThrottle={32}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerStyle={[s.rail, { paddingHorizontal: gutter, gap, scrollPaddingInline: gutter }]}
      >
        {row.items.map((item, index) => <ContentCard key={item.id || item._id || index} item={item} portrait={row.portrait} technical={technical} rank={row.displayRanking === true && Number.isInteger(item.rank) ? item.rank : undefined} onOpen={() => open(item)}/>) }
      </ScrollView>
      {arrows ? <>
        <Pressable disabled={atStart} accessibilityRole="button" accessibilityLabel={`Scroll ${row.title} left`} accessibilityState={{ disabled: atStart }} onPress={() => move(-1)} style={[s.arrow, s.left, !active && s.arrowHidden, atStart && s.arrowDisabled]}><Text style={s.arrowText}>‹</Text></Pressable>
        <Pressable disabled={atEnd} accessibilityRole="button" accessibilityLabel={`Scroll ${row.title} right`} accessibilityState={{ disabled: atEnd }} onPress={() => move(1)} style={[s.arrow, s.right, !active && s.arrowHidden, atEnd && s.arrowDisabled]}><Text style={s.arrowText}>›</Text></Pressable>
      </> : null}
    </View>
  </View>;
}

const s = StyleSheet.create({
  section: { zIndex: 2 },
  phoneSection: { marginTop: 34 },
  tabletSection: { marginTop: 40 },
  desktopSection: { marginTop: 48 },
  technical: { marginTop: 64, opacity: .58 },
  head: { marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { color: tokens.color.text, lineHeight: 1.2, fontWeight: '700', letterSpacing: 0 },
  phoneTitle: { fontSize: 22 },
  tabletTitle: { fontSize: 25 },
  desktopTitle: { fontSize: 28 },
  view: { color: tokens.color.accentSoft, fontWeight: '700' },
  railWrap: { position: 'relative' },
  rail: { paddingBottom: 10, scrollSnapType: 'x proximity', overscrollBehaviorInline: 'contain' },
  arrow: { position: 'absolute', top: '50%', marginTop: -22, width: 40, height: 40, borderRadius: 20, zIndex: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(12,12,18,.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,.18)', transitionDuration: '160ms', transitionProperty: 'opacity' },
  arrowHidden: { opacity: 0 },
  arrowDisabled: { opacity: .2 },
  left: { left: 8 },
  right: { right: 8 },
  arrowText: { color: '#fff', fontSize: 28, lineHeight: 30, fontWeight: '300' },
});
