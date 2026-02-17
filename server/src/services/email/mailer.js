const sendBroadcast = async ({ subject, body, recipients }) => {
  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new Error('No recipients supplied');
  }

  console.info('[Mailer] Simulating email broadcast');
  console.info('  Subject:', subject);
  console.info('  Recipients count:', recipients.length);

  // This is a placeholder. Integrate with real SMTP / provider here.
  await new Promise((resolve) => setTimeout(resolve, 100));
  return {
    accepted: recipients.length,
    rejected: [],
  };
};

module.exports = {
  sendBroadcast,
};
