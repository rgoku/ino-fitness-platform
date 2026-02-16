'use client';

import React, { JSX } from 'react';

export default function Home(): JSX.Element {

  return (
    <main style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Trainer Dashboard</h1>
        <p style={styles.subtitle}>Manage your clients and programs</p>
      </header>

      <section style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Clients</h2>
          <p style={styles.cardDescription}>View and manage your clients</p>
          <button style={styles.button}>Go to Clients</button>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Diet Plans</h2>
          <p style={styles.cardDescription}>Create personalized meal plans</p>
          <button style={styles.button}>Create Plan</button>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Workouts</h2>
          <p style={styles.cardDescription}>Design workout programs</p>
          <button style={styles.button}>Create Workout</button>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Reminders</h2>
          <p style={styles.cardDescription}>Schedule client reminders</p>
          <button style={styles.button}>Schedule Reminder</button>
        </div>
      </section>
    </main>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  } as React.CSSProperties,
  header: {
    marginBottom: '40px',
  } as React.CSSProperties,
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#333',
    margin: '0 0 8px 0',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: 0,
  } as React.CSSProperties,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  } as React.CSSProperties,
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  cardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    margin: '0 0 8px 0',
  } as React.CSSProperties,
  cardDescription: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 16px 0',
  } as React.CSSProperties,
  button: {
    backgroundColor: '#007AFF',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  } as React.CSSProperties,
};
