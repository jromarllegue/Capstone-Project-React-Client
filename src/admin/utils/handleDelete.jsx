import { showConfirmPopup } from '../../components/reactPopupService'

export function handleCheckboxChange(id, setSelectedItems) {
    setSelectedItems(prev => 
        prev.includes(id) 
            ? prev.filter(id => id !== id)
            : [...prev, id]
    );
};

export async function handleBulkDelete(deleteFunction, selectedItems, collection, load) {
    if (selectedItems.length === 0) return null;
    
    const conf = await showConfirmPopup({
        title: 'Deletion Warning',
        message: `Are you sure you want to delete ${selectedItems.length} selected ${collection}? All data related to these ${collection} will be lost.`,
        confirm_text: 'Confirm Delete',
        cancel_text: 'Cancel'
    });   

    if (conf) {
        load(true);
        return await deleteFunction(selectedItems);
    } 
    return null
};

export async function handleBulkRemove(removeFunction, selectedItems, parent_id, item, parent, load) {
    if (selectedItems.length === 0) return null;

    const conf = await showConfirmPopup({
        title: 'Removal Warning',
        message: `Are you sure you want to remove ${selectedItems.length} selected ${item} from this ${parent}?`,
        confirm_text: 'Confirm Remove',
        cancel_text: 'Cancel'
    });   

    if (conf) {
        load(true);
        return await removeFunction(parent_id, selectedItems);
    } 
    return null
};