export default function updateFeedbackReacts(setFeedback, feedback_id, react, action) {
    setFeedback(prev => {
        const new_feedback_list = [...prev];
        const feed = new_feedback_list.find(f => f.feedback_id === feedback_id);
  
        if (feed) {
            action === 'heart' ? feed.reacts.push(react) : feed.reacts = feed.reacts.filter(r => r.uid !== react.uid);
        }

        return new_feedback_list;
    });
}