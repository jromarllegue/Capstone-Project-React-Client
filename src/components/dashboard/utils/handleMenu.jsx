export default function handleMenu (ref_current, setShow, target) {
    if (ref_current && !ref_current.contains(target)) {
        setShow(false);
    }
}